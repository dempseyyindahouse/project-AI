// Tạo bản sao mới của mảng
function deepCopyArray(array) {
  let arrayCopy = array.map((element) => {
    return { ...element };
  });
  return arrayCopy;
}

function showAlert(message) {
  const alert = document.getElementById("alert");
  alert.innerHTML = message;
  alert.style.display = "block";
  setTimeout(function () {
    alert.style.display = "none";
  }, 3000);
}

export { deepCopyArray, showAlert };