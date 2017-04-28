function saveState(newState) {
  chrome.storage.sync.set({
    chromeOpenTabs: newState
  });
}

function setInputs({ chromeOpenTabs }) {
  const form = document.querySelector('form');
  const formElements = Array.from(form.elements);

  formElements.forEach(element => {
    if (chromeOpenTabs.hasOwnProperty(element.name)) {
      element.value = chromeOpenTabs[element.name];
    }

    // form elements disabled in markup, then activated after we load from storage.
    element.disabled = false;
  });
}

function reduceForm(formData, element) {
  return element.type === 'submit'
    ? formData
    : Object.assign({}, formData, { [element.name]: element.value });
}

function handleSubmit(e) {
  e.preventDefault();

  const elements = Array.from(e.target.elements);
  const formData = elements.reduce(reduceForm, {});

  saveState(formData);
}

const form = document.querySelector('form');
form.onsubmit = handleSubmit;

chrome.storage.sync.get({ chromeOpenTabs: {} }, setInputs);
chrome.storage.onChanged.addListener(({ chromeOpenTabs: { newValue } }) => {
  setInputs({ chromeOpenTabs: newValue });
});
