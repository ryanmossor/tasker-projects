/** @type {JsonData<CheckinJson>} */
const checkinJson = readJsonData({ filename: "checkin.json" });
const rewardsJson = checkinJson.data.rewards;

/**
 * Transforms reward name to HTML-friendly id
 * @param {string} rewardName
 * @returns {string} Lowercase reward name with all spaces replaced with `-`
 */
function createRewardId(rewardName) {
    return rewardName.replaceAll(" ", "-").toLowerCase();
}

/**
 * Decreases "Available" reward count by 1 when Redeem button pressed. Greys out Redeem button if necessary.
 * @param {string} rewardName
 */
function redeemReward(rewardName) {
    const availableRewardCount = /** @type {HTMLParagraphElement} */(document.getElementById(`${rewardName}`));
    availableRewardCount.innerText = `${Number(availableRewardCount.innerText) - 1}`;

    if (Number(availableRewardCount.innerText) < 1) {
        const redeemButton = /** @type {HTMLButtonElement} */(document.getElementById(`${rewardName}-redeem`));
        redeemButton.disabled = true;
        redeemButton.classList.add("btn-outline-secondary");
        redeemButton.classList.remove("btn-success");
    }
}

/**
 * Generates a component displaying a reward's name, number of unredeemed occurrences, and a `Redeem` button
 * @param {Reward} rewardObj
 * @returns {string} Reward row component
 */
function $RewardRow(rewardObj) {
    const rewardName = createRewardId(rewardObj.name);
    const shouldDisableButton = rewardObj.unredeemed < 1;

    return `
    <div class="container">
        <div class="row align-items-center">

        <div class="col-6">
            <p class="mb-0 ps-2 reward-title">${rewardObj.name}</p>
        </div>

        <div class="col-2">
            <p id="${rewardName}" class="mb-0 ms-2 rewards-available">${rewardObj.unredeemed}</p>
        </div>

        <div class="col-4">
            <button type="button" class="btn ${shouldDisableButton ? "btn-outline-secondary" : "btn-success"}"
                    id="${rewardName}-redeem" ${shouldDisableButton ? "disabled" : ""}
                    onclick="redeemReward('${rewardName}')">
                Redeem
            </button>
        </div>
    </div>

    <hr>
    </div>`;
}

/** Resets "Available" count for displayed rewards to be equal to the `unredeemed` property on the reward object */
function resetRewards() {
    rewardsJson.rewardList
        .filter((reward) => reward.name !== "blank")
        .forEach((reward) => {
            const rewardId = createRewardId(reward.name);
            const p = document.getElementById(rewardId);
            p.textContent = `${reward.unredeemed}`;

            if (reward.unredeemed > 0) {
                const redeemButton = /** @type {HTMLButtonElement} */(document.getElementById(`${rewardId}-redeem`));
                redeemButton.disabled = false;
                redeemButton.classList.add("btn-success");
                redeemButton.classList.remove("btn-outline-secondary");
            }
        });
}

/** Updates `unredeemed` count for any redeemed rewards and saves to `checkin.json` */
function submitResults() {
    try {
        const unredeemedRewards = Array.from(document.querySelectorAll(".rewards-available"))
            .reduce((acc, reward) => {
                const id = reward.getAttribute("id");
                if (id) {
                    acc[id] = reward.innerHTML;
                }
                return acc;
            }, {});

        for (const [key, value] of Object.entries(unredeemedRewards)) {
            const reward = rewardsJson.rewardList.find((x) => x.name.replaceAll(" ", "-").toLowerCase() === key);
            reward.unredeemed = Number(value);
        }

        checkinJson.data.rewards = rewardsJson;
        checkinJson.save();
    } catch (error) {
        tasker.flashLong(`${error}`);
    } finally {
        tasker.destroyScene(document.title);
    }
}

try {
    const mainDiv = document.getElementById("reward-items");
    const realRewards = rewardsJson.rewardList.filter((x) => x.name !== "blank");
    for (const i in realRewards) {
        mainDiv.innerHTML += $RewardRow(realRewards[i]);
    }
} catch (error) {
    tasker.flashLong(`${error}`);
}
