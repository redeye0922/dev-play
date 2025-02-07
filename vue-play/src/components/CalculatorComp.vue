<template>
  <div class="calculator-app">
    <div class="calculator-app-result" style="grid-area: result">
      {{ equation }}
    </div>

    <button style="grid-area: ac" @click="clear">AC</button>
    <button style="grid-area: plus-minus" @click="calculateToggle">±</button>
    <button style="grid-area: percent" @click="calculatePercentage">%</button>
    <button style="grid-area: add" @click="append('+')">+</button>
    <button style="grid-area: subtract" @click="append('-')">-</button>
    <button style="grid-area: multiply" @click="append('*')">×</button>
    <button style="grid-area: divide" @click="append('/')">÷</button>
    <button style="grid-area: equal" @click="calculate">=</button>

    <button style="grid-area: number-1" @click="append(1)">1</button>
    <button style="grid-area: number-2" @click="append(2)">2</button>
    <button style="grid-area: number-3" @click="append(3)">3</button>
    <button style="grid-area: number-4" @click="append(4)">4</button>
    <button style="grid-area: number-5" @click="append(5)">5</button>
    <button style="grid-area: number-6" @click="append(6)">6</button>
    <button style="grid-area: number-7" @click="append(7)">7</button>
    <button style="grid-area: number-8" @click="append(8)">8</button>
    <button style="grid-area: number-9" @click="append(9)">9</button>
    <button style="grid-area: number-0" @click="append(0)">0</button>

    <button style="grid-area: dot" @click="append('.')">.</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      equation: "0",
      isDecimalAdded: false,
      isOperatorAdded: false,
      isStarted: false,
    };
  },
  methods: {
    // Check if the character is an operator (+ / - / * / /)
    isOperator(character) {
      return ["+", "-", "*", "/"].indexOf(character) > -1;
    },
    // Handle keyboard input
    handleKeydown(event) {
      const key = event.key;
      switch (key) {
        case "Backspace":
          this.clearLast();
          break;
        case "Delete":
          this.clear();
          break;
        case "Enter":
        case "=":
          this.calculate();
          break;
        default:
          if (this.isOperator(key) || (key >= "0" && key <= "9") || key === ".") {
            this.append(key);
          }
          break;
      }
    },
    // Append character when pressed Operators or Numbers
    append(character) {
      if (this.equation === "0" && !this.isOperator(character)) {
        if (character === ".") {
          this.equation += "" + character;
          this.isDecimalAdded = true;
        } else {
          this.equation = "" + character;
        }
        this.isStarted = true;
        return;
      }

      if (!this.isOperator(character)) {
        if (character === "." && this.isDecimalAdded) {
          return;
        }
        if (character === ".") {
          this.isDecimalAdded = true;
          this.isOperatorAdded = true;
        } else {
          this.isOperatorAdded = false;
        }
        this.equation += "" + character;
      }

      if (this.isOperator(character) && !this.isOperatorAdded) {
        this.equation += "" + character;
        this.isDecimalAdded = false;
        this.isOperatorAdded = true;
      }
    },
    // Calculate result when '=' pressed
    calculate() {
      let result = this.equation
        .replace(new RegExp("\\*", "g"), "*")
        .replace(new RegExp("/", "g"), "/");
      this.equation = parseFloat(eval(result).toFixed(9)).toString();
      this.isDecimalAdded = false;
      this.isOperatorAdded = false;
    },
    // Toggle sign when '+/-' pressed
    calculateToggle() {
      if (this.isOperatorAdded || !this.isStarted) {
        return;
      }
      this.equation = this.equation + "* -1";
      this.calculate();
    },
    // Calculate percentage when '%' pressed
    calculatePercentage() {
      if (this.isOperatorAdded || !this.isStarted) {
        return;
      }
      this.equation = this.equation + "* 0.01";
      this.calculate();
    },
    // Clear display when 'AC' pressed
    clear() {
      this.equation = "0";
      this.isDecimalAdded = false;
      this.isOperatorAdded = false;
      this.isStarted = false;
    },
    // Clear the last character
    clearLast() {
      if (this.equation.length > 1) {
        this.equation = this.equation.slice(0, -1);
      } else {
        this.clear();
      }
    },
  },
  mounted() {
    window.addEventListener("keydown", this.handleKeydown);
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.handleKeydown);
  },
};
</script>

<style>
body {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #eee;
  margin: 0; /* 여백 제거 */
  padding: 0; /* 여백 제거 */
}

.calculator-app {
  --button-width: 80px;
  --button-height: 80px;

  display: grid;
  grid-template-areas:
    "result result result result"
    "ac plus-minus percent divide"
    "number-7 number-8 number-9 multiply"
    "number-4 number-5 number-6 subtract"
    "number-1 number-2 number-3 add"
    "number-0 number-0 dot equal";
  grid-template-columns: repeat(4, 1fr); /* 균등한 열 크기 설정 */
  grid-template-rows: repeat(6, var(--button-height));

  box-shadow: -8px -8px 16px -10px rgba(255, 255, 255, 1),
    8px 8px 16px -10px rgba(0, 0, 0, 0.15);
  padding: 24px;
  border-radius: 20px;
  box-sizing: border-box; /* 전체 컴포넌트를 화면에 맞게 조정 */
}

.calculator-app button {
  margin: 8px;
  padding: 0;
  border: 0;
  display: block;
  outline: none;
  border-radius: calc(var(--button-height) / 2);
  font-size: 24px;
  font-family: Helvetica;
  font-weight: normal;
  color: #999;
  background: linear-gradient(
    135deg,
    rgba(230, 230, 230, 1) 0%,
    rgba(246, 246, 246, 1) 100%
  );
  box-shadow: -4px -4px 10px -8px rgba(255, 255, 255, 1),
    4px 4px 10px -8px rgba(0, 0, 0, 0.3);
}

.calculator-app button:active {
  box-shadow: -4px -4px 10px -8px rgba(255, 255, 255, 1) inset,
    4px 4px 10px -8px rgba(0, 0, 0, 0.3) inset;
}

.calculator-app-result {
  text-align: right;
  line-height: var(--button-height);
  font-size: 56px; /* 폰트 크기 증가 */
  font-family: Helvetica;
  padding: 0 20px;
  color: #666;
  height: calc(var(--button-height) * 1.5); /* 결과 표시 영역 높이 조정 */
  grid-area: result; /* grid-area 적용 */
}
</style>


