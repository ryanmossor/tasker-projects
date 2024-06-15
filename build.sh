#!/usr/bin/env bash

if [[ ! -f "$(pwd)/package.json" && ! -d "$(pwd)/.git" ]]; then
    echo "Script must be run from project root" 
    exit 1
fi

# exit script if something errors
set -e

start=$(date +%s%N)

src_dir="./src"
build_dir="./build"

blue='\033[1;94m'
green='\033[1;92m'
purple='\033[1;95m'
red='\033[1;91m'
yellow='\033[1;93m'
clear='\033[0m'

echo_time() {
    echo -e "[$(date +%r)] $1"
}

device_connected() {
    command -v adb > /dev/null && adb devices | sed -E '/(^List.*$|^\s*$)/d' | grep -q 'device'
}

sed_find_replace() {
    pattern="$1"
    file="$2"

    if [[ $(uname -s) == "Darwin" ]]; then
        # -E enables extended regex -- allows for + and capturing with () rather than \(\)
        sed -i '' -E "${pattern}" "${file}"
    else
        sed -Ei "${pattern}" "${file}"
    fi
}

copy() {
    # expands all positional params except last
    # @:1 = first arg (@:0 is 'copy' -- i.e., name of function)
    # $# = total # of positional params passed
    # $#-1 = subtract 1 from total # of positional params
    files=( "${@:1:$#-1}" ) 

    # last positional param (space necessary for treating index as negative)
    dest="${@: -1}"

    for file in "${files[@]}"; do
        if [[ $tasker_dir == *"sdcard"* ]]; then
            adb push "${file}" "${dest}" > /dev/null
        else
            cp -r "${file}" "${dest}"
        fi
    done
}

run_tests=true

# Parse args and set flags
while [[ "$#" -gt 0 ]]; do
    case $1 in 
        --no-test|--no-tests|--skip-test|--skip-tests)
            run_tests=false
            break
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
    shift
done

# Restore node_modules if not present
[ ! -d "./node_modules" ] && npm ci

# Remove previous build
rm -rf "${build_dir}" && mkdir "${build_dir}"

# Check for overlooked !isTaskerEnv()
grep --color=auto -rno '!isEnvTasker()' "${src_dir}" &&
    echo "Leftover !isEnvTasker() -- canceling build..." &&
    exit 1

[ "$run_tests" == true ] && npx vitest run

# Process TypeScript files
echo_time "${blue}Compiling TypeScript...${clear}"
cp -r "${src_dir}/webviews" "${build_dir}"
npx tsc --project tsconfig.prod.json

# Copy scripts
echo_time "${purple}Copying scripts...${clear}"
cp -r "./scripts" "${build_dir}/scripts"

echo_time "${yellow}Processing JS files...${clear}"
while IFS= read -r file; do
    sed_find_replace '/.*__esModule.*$/d' "${file}" # Remove __esModule property definition to prevent exports not defined error
    sed_find_replace 's/.*(require\("temporal)-polyfill("\))/\1\2/' "${file}" # Makes temporal-polyfill a global (not a named) import
    sed_find_replace 's/temporal_polyfill_1\.//g' "${file}" # Removes prefix from Temporal calls
    sed_find_replace 's/(require\(")(.*\/)/\1/g' "${file}" # Remove filepath from require statements
    sed_find_replace '/.*require\("tasker"\);/d' "${file}" # Remove tasker import
    sed_find_replace 's/Tasker\.//g' "${file}" # Remove 'Tasker.' prefix from Tasker functions
done <<< "$(find "${build_dir}/typescript" -type f -name "*.js")"

# Process webview files
echo_time "${red}Processing webview files...${clear}"

# cp -r "${src_dir}"/webviews/* "${build_dir}/webviews"
npx tailwindcss -i "${build_dir}/webviews/input.css" -o "${build_dir}/webviews/output.css" --minify > /dev/null 2>&1
rm "${build_dir}/webviews/input.css"

while IFS= read -r file; do
    absolute_dir=$(dirname "${file}"| sed 's_\./build_/sdcard/Tasker_')
    # Relative -> absolute path (e.g., ./checkinFunctions.js -> /sdcard/Tasker/webviews/checkin/checkinFunctions.js)
    sed_find_replace "s_\"\.(\/.*\.(html|css|js))_\"${absolute_dir}\1_" "${file}" 

    # Relative parent path -> absolute path (e.g., ../webviewHelpers.js -> /sdcard/Tasker/webviews/webviewHelpers.js)
    sed_find_replace "s_\"\.\./(.*.(html|css|js))_\"/sdcard/Tasker/webviews/\1_" "${file}"

    sed_find_replace '/data-script-type="pc-dev-setup"/d' "$file" # Remove PC dev <script> tags
    sed_find_replace 's/Tasker\./window\.tk\./g' "${file}" # Replace 'Tasker.' prefix with 'window.tk.'
done <<< "$(find "${build_dir}/webviews" -type f \( -name "*.html" -o -name "*.js" \))"

# Cleanup
files_to_remove=(
    "./typescript/modules/taskerMocks.js"
    "./typescript/modules/tasker.js"
    "./webviews/tasker.js"
    "./webviews/typedefs.js"
    "./webviews/mocks.js"
)
pushd "${build_dir}" > /dev/null || exit
rm -f "${files_to_remove[@]}"
rm -rf ./src ./typescript/types
mv ./typescript ./javascript
popd > /dev/null || exit

# Copy build if phone connected, otherwise copy to mock phone directory
if device_connected; then
    tasker_dir="/sdcard/Tasker"
    adb shell mkdir -p "${tasker_dir}" > /dev/null
else
    tasker_dir="${build_dir}/phone/Tasker"
    mkdir -p "${tasker_dir}"
fi

echo
echo_time "Copying ${blue}build output${clear} to ${green}${tasker_dir}${clear}..."
copy "${build_dir}/javascript" "${build_dir}/scripts" "${build_dir}/webviews" "${tasker_dir}"

declare -A node_modules
# ["location in node_modules"]="desiredNameInPhoneModulesDir.js"
node_modules=(
    ["axios/dist/axios.min.js"]="axios.js"
    ["temporal-polyfill/global.min.js"]="temporal.js"
)
echo_time "Copying ${blue}node modules${clear} to ${green}${tasker_dir}/javascript/modules${clear}..."
for key in "${!node_modules[@]}"; do
    copy "./node_modules/${key}" "${tasker_dir}/javascript/modules/${node_modules[$key]}" 
done

end=$(date +%s%N)
elapsed=$(echo "scale=2; ($end - $start) / 1000000000" | bc)
echo "Done in ${elapsed} seconds"
