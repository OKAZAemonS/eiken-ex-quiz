// 共通クイズスクリプト (quiz.js)
// 各ユニットページで window.UNIT_ITEMS を定義してから読み込む

document.addEventListener("DOMContentLoaded", () => {
  const container = document.createElement("div");
  container.style.margin = "1em 0";

  const randomBtn = document.createElement("button");
  randomBtn.textContent = "順番をランダムにする";
  randomBtn.style.marginRight = "0.5em";

  const resetBtn = document.createElement("button");
  resetBtn.textContent = "元の順番に戻す";

  container.appendChild(randomBtn);
  container.appendChild(resetBtn);

  document.body.insertBefore(container, document.body.firstChild);

  let currentItems = [...window.UNIT_ITEMS];
  let originalItems = [...window.UNIT_ITEMS];

  function renderQuiz() {
    const quizContainer = document.getElementById("quiz-container");
    quizContainer.innerHTML = "";
    currentItems.forEach((item, index) => {
      const card = document.createElement("div");
      card.style.marginBottom = "1.5em";

      const sentence = document.createElement("p");
      const parts = item.sentence.split(" ");
      let replaced = false;
      const sentenceHTML = parts.map(word => {
        if (!replaced && word.includes(item.word)) {
          replaced = true;
          return `<span style="color: red;">( )</span>`;
        }
        return word;
      }).join(" ");
      sentence.innerHTML = sentenceHTML;
      card.appendChild(sentence);

      const optionsDiv = document.createElement("div");
      const options = [item.word, ...(item.wrong || [])];
      shuffleArray(options);
      options.forEach(opt => {
        const btn = document.createElement("button");
        btn.textContent = opt;
        btn.style.margin = "0.2em";
        btn.onclick = () => {
          if (opt === item.word) {
            btn.style.background = "lightgreen";
            const jp = document.createElement("p");
            jp.innerHTML = item.jp_sentence.replace(item.jp_word, `<b>${item.jp_word}</b>`);
            card.appendChild(jp);
          } else {
            btn.style.background = "salmon";
          }
        };
        optionsDiv.appendChild(btn);
      });
      card.appendChild(optionsDiv);
      quizContainer.appendChild(card);
    });
  }

  randomBtn.addEventListener("click", () => {
    currentItems = shuffleArray([...originalItems]);
    renderQuiz();
  });

  resetBtn.addEventListener("click", () => {
    currentItems = [...originalItems];
    renderQuiz();
  });

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // 初期表示
  renderQuiz();
});
