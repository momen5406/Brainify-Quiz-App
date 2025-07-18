  const categories = document.querySelectorAll(".category");

  categories.forEach((category) => {
    category.addEventListener("click", () => {
      // Unselect all first
      categories.forEach((c) => {
        c.classList.remove("selected");
        c.querySelector("input[type='radio']").checked = false;
      });

      // Select clicked one
      category.classList.add("selected");
      category.querySelector("input[type='radio']").checked = true;
      console.log("Selected Category: ", category.dataset.category);
      
    });
  });
