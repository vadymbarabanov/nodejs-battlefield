new window.EventSource("/sse").onmessage = function (e) {
  window.messages.innerHTML += `<p>${e.data}</p>`;
};

window.form.addEventListener("submit", function (e) {
  e.preventDefault();

  window.fetch(`/chat?message=${window.input.value}`);
  window.input.value = "";
});
