const emitters = {
  open: function (command) {
    const url = /^(file|http|https):\/\//.test(command.target)
      ? `"${command.target}"`
      : `(new URL("${command.target}", BASE_URL)).href`;
    return {
      code: `$browser.get(${url})`,
      promise: true
    };
  },
  setWindowSize: function (command) {
    const result = /(\d+)[xX](\d+)/.exec(command.target),
      width = result[1],
      height = result[2];
    return {
      code: `$browser.manage().window().setSize(${width}, ${height})`,
      promise: true
    };
  }
};

export function emit(command, options = {}) {
  if (!emitters[command.command]) {
    return null;
  }
  return emitters[command.command](command);
}

export default {
  emit
};
