let beansElement = document.getElementById("coffee-beans");
let ratioElement = document.getElementById("ratio");
let waterElement = document.getElementById("water");
let yieldElement = document.getElementById("coffee-yield");
let timeReceiverElement = document.getElementById("timereceiver");
let timerDynamicElement = document.getElementById("dynamictimer");
let startElement = document.getElementById("start");
let pauseElement = document.getElementById("pause");
let resetElement = document.getElementById("reset");
let last2Inputs = [beansElement, waterElement];
let ID;
let timeRemain;
let progressElement = document.getElementById("progress");
let infoBoxElement = document.getElementById("infoBox");


const coffeeBeansInput = (event) => {
    let index = event.target.value.indexOf(".");
    if (index >= 1 && event.target.value.length - index >= 4) {
        let roundValue = Number(event.target.value).toFixed(2);
        event.target.value = roundValue;
    }
    let beansValue = beansElement.value;
    let ratioValue = ratioElement.value;
    let waterValue = waterElement.value;
    if (event.target !== last2Inputs[0]) {
        last2Inputs = [event.target, last2Inputs[0]];
    }
    if (last2Inputs.includes(beansElement) && last2Inputs.includes(ratioElement)) {
        waterValue = beansValue * ratioValue;
        waterElement.value = waterValue.toFixed(2);
    } else if (last2Inputs.includes(beansElement) && last2Inputs.includes(waterElement)) {
        ratioValue = waterValue / beansValue;
        ratioElement.value = ratioValue.toFixed(2);
    } else {
        beansValue = waterValue / ratioValue;
        beansElement.value = beansValue.toFixed(2);
    }

    let yieldValue = 0.9 * waterValue;
    yieldElement.value = yieldValue.toFixed(2);
};
beansElement.addEventListener("input", coffeeBeansInput);
ratioElement.addEventListener("input", coffeeBeansInput);
waterElement.addEventListener("input", coffeeBeansInput);

const yieldInput = (event) => {
    let index = event.target.value.indexOf(".");
    if (index >= 1 && event.target.value.length - index >= 4) {
        let roundValue = Number(event.target.value).toFixed(2);
        event.target.value = roundValue;
    }

    let beansValue = beansElement.value;
    let ratioValue = ratioElement.value;
    let yieldValue = yieldElement.value;
    let waterValue = yieldValue / 0.9;
    waterElement.value = waterValue.toFixed(2);
    if (waterElement !== last2Inputs[0]) {
        last2Inputs = [waterElement, last2Inputs[0]];
    }
    if (last2Inputs.includes(beansElement) && last2Inputs.includes(waterElement)) {
        ratioValue = waterValue / beansValue;
        ratioElement.value = ratioValue.toFixed(2);
    } else {
        beansValue = waterValue / ratioValue;
        beansElement.value = beansValue.toFixed(2);
    }
};
yieldElement.addEventListener("input", yieldInput);

const timeStart = () => {
    if (!ID && timeRemain > 0) {
        ID = setInterval(() => {
            timeRemain -= 1;
            timeConvertor(timeRemain);
            if (timeRemain === 0) {
                clearInterval(ID);
            }
        }, 1000);
    }
};
const timePause = () => {
    clearInterval(ID);
    ID = undefined;
};

const timeReset = () => {
    clearInterval(ID);
    ID = undefined;
    let timeReceiveValue = timeReceiverElement.value;
    if (timeReceiveValue > 0) {
        timeRemain = Math.round(timeReceiveValue * 60);
        progressElement.max = timeRemain;
        timeConvertor(timeRemain);
    }
};

const timeConvertor = (seconds) => {
    let minutes = Math.floor(seconds / 60);
    let sekundy = seconds % 60;
    if (sekundy <= 9) {
        sekundy = "0" + sekundy;
    }
    dynamictimer.value = `${minutes}:${sekundy}`;
    let timeReceiveValue = Number(progressElement.max);
    //progressElement.value = timeReceiveValue - seconds
    const percentage = (1 - timeRemain / timeReceiveValue) * 100;
    progressElement.style.width = `${percentage}%`;
    progressElement.setAttribute("aria-valuenow", percentage);

};

const isSunRise = async () => {
    try {
        const position = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        const now = new Date();
        const response = await fetch(
            `https://api.sunrise-sunset.org/json?lat=${position.coords.latitude}&lng=${position.coords.longitude}&date=${now.toDateString()}&formatted=0`
        );
        if (!response.ok) {
            await Promise.reject("not ok");
        }
        const jsonResponse = await response.json();

        const sunrise = new Date(jsonResponse.results.sunrise);
        const sunset = new Date(jsonResponse.results.sunset);
        const hours = now.getHours();

        if (now < sunrise) {
            infoBoxElement.innerHTML =
                "⚠️ You should wait few hours after getting up before making the first cup of coffee.";
        } else if (hours < 10) {
            infoBoxElement.innerHTML = " ☕ Just now it's an ideal time to have a coffee.";
        } else if (hours < 16) {
            infoBoxElement.innerHTML = " ☕ You're fine having a coffee now.";
        } else if (now < sunset) {
            infoBoxElement.innerHTML = " ⚠️ Beware, you shouldn't drink coffee at least 6 hours before sleep.";
        } else {
            infoBoxElement.innerHTML = "❌ It's already night, you definitely shouldn't be drinking coffee now.";
        }
    } catch (error) {
        return error;
    }
};

isSunRise();

timeReceiverElement.addEventListener("input", timeReset);
startElement.addEventListener("click", timeStart);
pauseElement.addEventListener("click", timePause);
resetElement.addEventListener("click", timeReset);
