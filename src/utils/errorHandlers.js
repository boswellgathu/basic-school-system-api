const catchErrors = promise => (
  promise
    .then(data => [null, data])
    .catch(err => [err, null])
);

module.exports = {
  catchErrors
};
