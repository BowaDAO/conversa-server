const Yup = require("yup");

const formSchema = Yup.object({
  username: Yup.string()
    .required("Username is required")
    .min(6, "Username is too short")
    .max(28, "Username is too long"),
  password: Yup.string()
    .required("Enter your passwod")
    .min(6, "Password is too short"),
});

const validateForm = (req, res, next) => {
  const formData = req.body;

  formSchema
    .validate(formData)
    .catch((error) => {
      res.status(422).send(error.errors[0]);
    })
    .then((valid) => {
      if (valid) {
        next();
      } else {
        res.status(422).send();
      }
    });
};

module.exports = validateForm;
