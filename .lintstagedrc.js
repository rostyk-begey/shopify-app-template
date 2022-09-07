module.exports = {
  '*': (files) => [
    `nx format:write --files=${files.join(',')}`,
    `nx affected:lint --fix --files=${files.join(',')}`,
    `git add ${files.join(' ')}`,
  ],
};
