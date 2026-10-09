
import { useState } from "react";
import axios from "axios";

function StudentForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [age, setAge] = useState("");

    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const validateForm = () => {
        const errors = {};

        if (!name.trim()) {
            errors.name = "Name is required";
        }

        if (!email.trim()) {
            errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = "Please enter a valid email";
        }

        if (!age) {
            errors.age = "Age is required";
        } else if (Number(age) <= 0) {
            errors.age = "Age must be greater than 0";
        }

        setFormErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSuccessMessage("");
        setErrorMessage("");

        const isValid = validateForm();

        if (!isValid) {
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                "/api/students",
                {
                    name: name,
                    email: email,
                    age: Number(age)
                }
            );

            console.log("Student added:", response.data);

            setSuccessMessage("Student added successfully!");

            setName("");
            setEmail("");
            setAge("");
            setFormErrors({});
        } catch (error) {
            console.error("Error:", error);

            setErrorMessage(
                "Failed to add student. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card border-0 shadow-sm p-4">
            <div className="mb-4">
                <h2 className="fw-bold mb-1">
                    Add Student
                </h2>

                <p className="text-muted mb-0">
                    Enter student information below
                </p>
            </div>

            {successMessage && (
                <div className="alert alert-success" role="alert">
                    {successMessage}
                </div>
            )}

            {errorMessage && (
                <div className="alert alert-danger" role="alert">
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label fw-semibold">
                        Student Name
                    </label>

                    <input
                        type="text"
                        className={`form-control ${
                            formErrors.name ? "is-invalid" : ""
                        }`}
                        placeholder="Enter student name"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);

                            setFormErrors({
                                ...formErrors,
                                name: ""
                            });
                        }}
                    />

                    {formErrors.name && (
                        <div className="invalid-feedback">
                            {formErrors.name}
                        </div>
                    )}
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold">
                        Email Address
                    </label>

                    <input
                        type="email"
                        className={`form-control ${
                            formErrors.email ? "is-invalid" : ""
                        }`}
                        placeholder="Enter email address"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);

                            setFormErrors({
                                ...formErrors,
                                email: ""
                            });
                        }}
                    />

                    {formErrors.email && (
                        <div className="invalid-feedback">
                            {formErrors.email}
                        </div>
                    )}
                </div>

                <div className="mb-4">
                    <label className="form-label fw-semibold">
                        Age
                    </label>

                    <input
                        type="number"
                        className={`form-control ${
                            formErrors.age ? "is-invalid" : ""
                        }`}
                        placeholder="Enter age"
                        value={age}
                        onChange={(e) => {
                            setAge(e.target.value);

                            setFormErrors({
                                ...formErrors,
                                age: ""
                            });
                        }}
                    />

                    {formErrors.age && (
                        <div className="invalid-feedback">
                            {formErrors.age}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                >
                    {loading ? "Adding Student..." : "Add Student"}
                </button>
            </form>
        </div>
    );
}

export default StudentForm;

