module.exports = {
    parser: "@typescript-eslint/parser",
    env: {
        browser: true,
        node: true,
        jest: true
    },
    // plugin: ['@typescript-eslint/eslint-plugin'],
    extends: [
        "airbnb-base",
        "airbnb-typescript/base"
    ],
    globals: {
        "vi": "readonly",
    },
    ignorePatterns: [
        ".eslintrc.js",
        "/build",
        "/dist",
        "/src/**/require.js",
    ],
    parserOptions: {
        ecmaVersion: "latest",
        project: './tsconfig.json'
    },
    overrides: [
        {
            files: ["**/*.test.ts"],
            rules: {
                "brace-style": ["warn", "1tbs", { "allowSingleLine": true }],
                "curly": ["warn", "multi-or-nest"],
            },
        },
        {
            files: ["src/webviews/**/*.js"],
            rules: {
                "no-undef": "off",
                "@typescript-eslint/no-unused-vars": "off",
                "no-restricted-globals": "off",
                "no-alert": "off",
            },
        },
        {
            files: ["src/typescript/modules/require.ts"],
            rules: {
                "@typescript-eslint/no-unused-vars": "off",
                "@typescript-eslint/no-implied-eval": "off",
            },
        }
    ],
    rules: {
        "brace-style": ["warn", "1tbs", { "allowSingleLine": false }],
        "camelcase": "warn",
        "consistent-return": "off",
        "curly": ["warn", "all"],
        "guard-for-in": "off",
        "@typescript-eslint/import/no-unresolved": "off",
        "@typescript-eslint/import/extensions": "off",
        "import/no-extraneous-dependencies": "off",
        "import/prefer-default-export": "off",
        "@typescript-eslint/indent": ["warn", 4],
        "linebreak-style": "off",
        "max-classes-per-file": ["warn", 3],
        "max-len": ["warn", {
            code: 120,
            ignoreStrings: true,
            ignoreComments: true,
            ignoreTemplateLiterals: true,
        }],
        "no-continue": "off",
        "no-param-reassign": ["warn", { props: false }],
        "no-plusplus": "off",
        "no-restricted-syntax": ["off", "BinaryExpression[operator='in']"],
        "no-undef": "warn",
        "no-underscore-dangle": "off",
        "@typescript-eslint/no-unused-vars": ["warn", { vars: "all" }],
        "@typescript-eslint/no-var": "off",
        "nonblock-statement-body-position": ["warn", "below"],
        "object-curly-newline": "off",
        "@typescript-eslint/one-var": "off",
        "@typescript-eslint/one-var-declaration-per-line": "off",
        "@typescript-eslint/quotes": ["error", "double"],
        "quote-props": ["error", "consistent"],
        "spaced-comment": "off",
        "@typescript-eslint/vars-on-top": "off",
        "@typescript-eslint/naming-convention": "off"
    },
};
