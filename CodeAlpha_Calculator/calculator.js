let expression = "";

const resultDisplay = document.getElementById("result");
const expressionDisplay = document.getElementById("expression");

// Update calculator display
function updateDisplay() {
    expressionDisplay.textContent = expression
        .replace(/\*/g, "×")
        .replace(/\//g, "÷");

    if (!expression) {
        resultDisplay.textContent = "0";
        return;
    }

    try {
        const value = evaluate(expression);

        resultDisplay.textContent =
            Number.isFinite(value)
                ? Number(value.toPrecision(12)).toString()
                : "Error";
    } catch {
        resultDisplay.textContent = "0";
    }
}

// Safe arithmetic parser (without eval)
function evaluate(str) {
    const tokens = str.match(
        /(?:\d+\.?\d*|\.\d+)|[+\-*/%()]/g
    );

    if (!tokens || tokens.join("") !== str.replace(/\s/g, "")) {
        throw Error("Invalid expression");
    }

    let pos = 0;

    function primary() {
        if (tokens[pos] === "(") {
            pos++;
            const value = addSub();

            if (tokens[pos] !== ")") {
                throw Error("Missing )");
            }

            pos++;
            return value;
        }

        if (tokens[pos] === "-") {
            pos++;
            return -primary();
        }

        if (tokens[pos] === "+") {
            pos++;
            return primary();
        }

        const token = tokens[pos++];

        if (!token || !/^(?:\d+\.?\d*|\.\d+)$/.test(token)) {
            throw Error("Invalid number");
        }

        return Number(token);
    }

    function percent() {
        let value = primary();

        while (tokens[pos] === "%") {
            pos++;
            value /= 100;
        }

        return value;
    }

    function multiplyDivide() {
        let value = percent();

        while (tokens[pos] === "*" || tokens[pos] === "/") {
            const op = tokens[pos++];
            const next = percent();

            if (op === "/" && next === 0) {
                throw Error("Division by zero");
            }

            value = op === "*" ? value * next : value / next;
        }

        return value;
    }

    function addSub() {
        let value = multiplyDivide();

        while (tokens[pos] === "+" || tokens[pos] === "-") {
            const op = tokens[pos++];
            const next = multiplyDivide();

            value = op === "+" ? value + next : value - next;
        }

        return value;
    }

    const answer = addSub();

    if (pos !== tokens.length || !Number.isFinite(answer)) {
        throw Error("Invalid expression");
    }

    return answer;
}

// Add numbers and operators
function append(value) {
    if (resultDisplay.textContent === "Error") {
        expression = "";
    }

    expression += value;
    updateDisplay();
}

// Clear everything
function clearDisplay() {
    expression = "";
    updateDisplay();
}

// Delete last character
function deleteLast() {
    expression = expression.slice(0, -1);
    updateDisplay();
}

// Calculate final result
function calculate() {
    try {
        const answer = evaluate(expression);

        expression = String(Number(answer.toPrecision(12)));

        updateDisplay();
    } catch {
        resultDisplay.textContent = "Error";
    }
}

// Keyboard support
document.addEventListener("keydown", function(event) {
    const key = event.key;

    if (/^[0-9.+\-*/%()]$/.test(key)) {
        append(key);
    }
    else if (key === "Enter" || key === "=") {
        calculate();
    }
    else if (key === "Backspace") {
        deleteLast();
    }
    else if (key === "Escape" || key === "Delete") {
        clearDisplay();
    }
});

// Initialize calculator
updateDisplay();