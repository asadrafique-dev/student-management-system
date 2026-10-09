
import { useEffect, useRef, useState } from "react";
import axios from "axios";

function StudentList() {
    const [students, setStudents] = useState([]);
    const [editingStudent, setEditingStudent] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [editErrors, setEditErrors] = useState({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [updateLoading, setUpdateLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");
    const [actionError, setActionError] = useState("");

    const studentsPerPage = 6;
    const editFormRef = useRef(null);

    // Get all students from the backend
    const getStudents = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get("/api/students");
            setStudents(response.data);
        } catch (err) {
            console.error("Error fetching students:", err);
            setError("Failed to load students. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getStudents();
    }, []);

    // Validate edit form
    const validateEditForm = () => {
        const errors = {};

        const name = editingStudent.name.trim();
        const email = editingStudent.email.trim();
        const age = editingStudent.age;

        if (!name) {
            errors.name = "Name is required";
        }

        if (!email) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Please enter a valid email";
        }

        if (age === "" || age === null || age === undefined) {
            errors.age = "Age is required";
        } else if (!Number.isFinite(Number(age)) || Number(age) <= 0) {
            errors.age = "Age must be greater than 0";
        }

        setEditErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Update student
    const updateStudent = async () => {
        if (!editingStudent || !validateEditForm()) {
            return;
        }

        try {
            setUpdateLoading(true);
            setSuccessMessage("");
            setActionError("");

            const response = await axios.put(
                `/api/students/${editingStudent._id}`,
                {
                    name: editingStudent.name.trim(),
                    email: editingStudent.email.trim(),
                    age: Number(editingStudent.age),
                }
            );

            console.log("Student updated:", response.data);

            setEditingStudent(null);
            setEditErrors({});
            setSuccessMessage("Student updated successfully!");

            await getStudents();
        } catch (err) {
            console.error("Error updating student:", err);

            setActionError(
                err.response?.data?.message ||
                    "Failed to update student. Please try again."
            );
        } finally {
            setUpdateLoading(false);
        }
    };

    // Delete student
    const deleteStudent = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this student?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            setDeleteLoading(true);
            setSuccessMessage("");
            setActionError("");

            await axios.delete(`/api/students/${id}`);

            setSuccessMessage("Student deleted successfully!");

            if (editingStudent?._id === id) {
                setEditingStudent(null);
                setEditErrors({});
            }

            await getStudents();
        } catch (err) {
            console.error("Error deleting student:", err);

            setActionError(
                err.response?.data?.message ||
                    "Failed to delete student. Please try again."
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    // Open edit form and scroll to it
    const handleEdit = (student) => {
        setSuccessMessage("");
        setActionError("");
        setEditingStudent({ ...student });
        setEditErrors({});

        setTimeout(() => {
            editFormRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 100);
    };

    // Search by name or email
    const filteredStudents = students.filter((student) => {
        const name = (student.name || "").toLowerCase();
        const email = (student.email || "").toLowerCase();
        const search = searchTerm.toLowerCase().trim();

        return name.includes(search) || email.includes(search);
    });

    // Sort students
    const sortedStudents = [...filteredStudents].sort((a, b) => {
        if (sortOption === "name-asc") {
            return a.name.localeCompare(b.name);
        }

        if (sortOption === "name-desc") {
            return b.name.localeCompare(a.name);
        }

        if (sortOption === "age-asc") {
            return Number(a.age) - Number(b.age);
        }

        if (sortOption === "age-desc") {
            return Number(b.age) - Number(a.age);
        }

        return 0;
    });

    // Pagination calculations
    const totalPages = Math.ceil(
        sortedStudents.length / studentsPerPage
    );

    const startIndex = (currentPage - 1) * studentsPerPage;

    const currentStudents = sortedStudents.slice(
        startIndex,
        startIndex + studentsPerPage
    );

    // Keep the current page valid after deleting or filtering students
    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        } else if (totalPages === 0 && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    return (
        <div className="mt-5">
            {/* Dashboard Summary */}
            <div className="row mb-4">
                <div className="col-md-4 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-2">
                                        Total Students
                                    </p>
                                    <h2 className="fw-bold mb-0">
                                        {students.length}
                                    </h2>
                                </div>

                                <div
                                    className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "55px",
                                        height: "55px",
                                    }}
                                >
                                    <i className="bi bi-people-fill fs-3"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-2">
                                        Showing Students
                                    </p>
                                    <h2 className="fw-bold mb-0">
                                        {sortedStudents.length}
                                    </h2>
                                </div>

                                <div
                                    className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "55px",
                                        height: "55px",
                                    }}
                                >
                                    <i className="bi bi-person-check-fill fs-3"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-2">
                                        Total Pages
                                    </p>
                                    <h2 className="fw-bold mb-0">
                                        {totalPages}
                                    </h2>
                                </div>

                                <div
                                    className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "55px",
                                        height: "55px",
                                    }}
                                >
                                    <i className="bi bi-file-earmark-text-fill fs-3"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="alert alert-success" role="alert">
                    {successMessage}
                </div>
            )}

            {/* Action Error */}
            {actionError && (
                <div className="alert alert-danger" role="alert">
                    {actionError}
                </div>
            )}

            {/* Edit Student Form */}
            {editingStudent && (
                <div
                    ref={editFormRef}
                    className="card border-0 shadow-sm p-4 mb-5"
                >
                    <div className="d-flex align-items-center mb-4">
                        <div
                            className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{
                                width: "50px",
                                height: "50px",
                            }}
                        >
                            <i className="bi bi-pencil-square fs-4"></i>
                        </div>

                        <div>
                            <h3 className="fw-bold mb-1">
                                Edit Student
                            </h3>
                            <p className="text-muted mb-0">
                                Update the student's information
                            </p>
                        </div>
                    </div>

                    {/* Student Name */}
                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                            <i className="bi bi-person me-1"></i>
                            Student Name
                        </label>

                        <div className="input-group">
                            <span className="input-group-text bg-white">
                                <i className="bi bi-person"></i>
                            </span>

                            <input
                                type="text"
                                className={`form-control ${
                                    editErrors.name ? "is-invalid" : ""
                                }`}
                                value={editingStudent.name}
                                onChange={(e) => {
                                    setEditingStudent({
                                        ...editingStudent,
                                        name: e.target.value,
                                    });

                                    setEditErrors({
                                        ...editErrors,
                                        name: "",
                                    });
                                }}
                            />
                        </div>

                        {editErrors.name && (
                            <div className="text-danger small mt-1">
                                {editErrors.name}
                            </div>
                        )}
                    </div>

                    {/* Email */}
                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                            <i className="bi bi-envelope me-1"></i>
                            Email Address
                        </label>

                        <div className="input-group">
                            <span className="input-group-text bg-white">
                                <i className="bi bi-envelope"></i>
                            </span>

                            <input
                                type="email"
                                className={`form-control ${
                                    editErrors.email ? "is-invalid" : ""
                                }`}
                                value={editingStudent.email}
                                onChange={(e) => {
                                    setEditingStudent({
                                        ...editingStudent,
                                        email: e.target.value,
                                    });

                                    setEditErrors({
                                        ...editErrors,
                                        email: "",
                                    });
                                }}
                            />
                        </div>

                        {editErrors.email && (
                            <div className="text-danger small mt-1">
                                {editErrors.email}
                            </div>
                        )}
                    </div>

                    {/* Age */}
                    <div className="mb-4">
                        <label className="form-label fw-semibold">
                            <i className="bi bi-calendar3 me-1"></i>
                            Age
                        </label>

                        <div className="input-group">
                            <span className="input-group-text bg-white">
                                <i className="bi bi-calendar3"></i>
                            </span>

                            <input
                                type="number"
                                min="1"
                                className={`form-control ${
                                    editErrors.age ? "is-invalid" : ""
                                }`}
                                value={editingStudent.age}
                                onChange={(e) => {
                                    setEditingStudent({
                                        ...editingStudent,
                                        age:
                                            e.target.value === ""
                                                ? ""
                                                : Number(e.target.value),
                                    });

                                    setEditErrors({
                                        ...editErrors,
                                        age: "",
                                    });
                                }}
                            />
                        </div>

                        {editErrors.age && (
                            <div className="text-danger small mt-1">
                                {editErrors.age}
                            </div>
                        )}
                    </div>

                    {/* Form Buttons */}
                    <div className="d-flex gap-2 flex-wrap">
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={updateStudent}
                            disabled={updateLoading}
                        >
                            {updateLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Updating Student...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-circle me-1"></i>
                                    Update Student
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => {
                                setEditingStudent(null);
                                setEditErrors({});
                            }}
                            disabled={updateLoading}
                        >
                            <i className="bi bi-x-circle me-1"></i>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Students List Header */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                    <div className="row align-items-center g-3">
                        <div className="col-lg-4">
                            <h2 className="fw-bold mb-1">
                                Students List
                            </h2>
                            <p className="text-muted mb-0">
                                View and manage student records
                            </p>
                        </div>

                        {/* Search */}
                        <div className="col-lg-3">
                            <div className="input-group">
                                <span className="input-group-text bg-white">
                                    <i className="bi bi-search"></i>
                                </span>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search students..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />

                                {searchTerm && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => {
                                            setSearchTerm("");
                                            setCurrentPage(1);
                                        }}
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Sort */}
                        <div className="col-lg-3">
                            <div className="input-group">
                                <span className="input-group-text bg-white">
                                    <i className="bi bi-sort-down"></i>
                                </span>

                                <select
                                    className="form-select"
                                    value={sortOption}
                                    onChange={(e) => {
                                        setSortOption(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="">
                                        Sort Students
                                    </option>
                                    <option value="name-asc">
                                        Name A → Z
                                    </option>
                                    <option value="name-desc">
                                        Name Z → A
                                    </option>
                                    <option value="age-asc">
                                        Age Low → High
                                    </option>
                                    <option value="age-desc">
                                        Age High → Low
                                    </option>
                                </select>
                            </div>
                        </div>

                        {/* Student Count */}
                        <div className="col-lg-2 text-lg-end">
                            <span className="badge bg-primary fs-6 px-3 py-2">
                                <i className="bi bi-people-fill me-1"></i>
                                {students.length} Students
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading, Error and Empty States */}
            {loading ? (
                <div className="card border-0 shadow-sm p-4 text-center">
                    <div
                        className="spinner-border text-primary mx-auto mb-3"
                        role="status"
                    >
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted mb-0">
                        Loading students...
                    </p>
                </div>
            ) : error ? (
                <div className="card border-0 shadow-sm p-4 text-center">
                    <p className="text-danger mb-3">{error}</p>

                    <div>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={getStudents}
                        >
                            <i className="bi bi-arrow-clockwise me-1"></i>
                            Try Again
                        </button>
                    </div>
                </div>
            ) : students.length === 0 ? (
                <div className="card border-0 shadow-sm p-4 text-center">
                    <i className="bi bi-people fs-1 text-muted mb-3"></i>
                    <h5 className="fw-bold">No Students Yet</h5>
                    <p className="text-muted mb-0">
                        Add a student using the form above.
                    </p>
                </div>
            ) : sortedStudents.length === 0 ? (
                <div className="card border-0 shadow-sm p-4 text-center">
                    <i className="bi bi-search fs-1 text-muted mb-3"></i>
                    <p className="text-muted mb-3">
                        No students match your search.
                    </p>

                    <div>
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => {
                                setSearchTerm("");
                                setCurrentPage(1);
                            }}
                        >
                            Clear Search
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Student Cards */}
                    <div className="row">
                        {currentStudents.map((student) => (
                            <div
                                className="col-md-6 col-lg-4 mb-4"
                                key={student._id}
                            >
                                <div className="card border-0 shadow-sm h-100 p-4">
                                    {/* Student Header */}
                                    <div className="d-flex align-items-center mb-3">
                                        <div
                                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold me-3 flex-shrink-0"
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                fontSize: "20px",
                                            }}
                                        >
                                            {(student.name || "?")
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div className="overflow-hidden">
                                            <h5 className="fw-bold mb-1 text-break">
                                                {student.name}
                                            </h5>
                                            <small className="text-muted text-break">
                                                Student ID: {student._id}
                                            </small>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="mb-3">
                                        <small className="text-muted d-block mb-1">
                                            <i className="bi bi-envelope me-1"></i>
                                            Email
                                        </small>
                                        <span className="fw-semibold text-break">
                                            {student.email}
                                        </span>
                                    </div>

                                    {/* Age */}
                                    <div className="mb-4">
                                        <small className="text-muted d-block mb-1">
                                            <i className="bi bi-calendar3 me-1"></i>
                                            Age
                                        </small>
                                        <span className="badge bg-light text-dark border">
                                            {student.age} years
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-auto d-flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-outline-warning"
                                            onClick={() => handleEdit(student)}
                                            disabled={deleteLoading || updateLoading}
                                        >
                                            <i className="bi bi-pencil-square me-1"></i>
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            onClick={() =>
                                                deleteStudent(student._id)
                                            }
                                            disabled={deleteLoading || updateLoading}
                                        >
                                            {deleteLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                                    Deleting...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-trash3 me-1"></i>
                                                    Delete
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 mb-4">
                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setCurrentPage((page) => page - 1)
                                }
                            >
                                <i className="bi bi-chevron-left me-1"></i>
                                Previous
                            </button>

                            {Array.from(
                                { length: totalPages },
                                (_, index) => (
                                    <button
                                        type="button"
                                        key={index}
                                        className={`btn ${
                                            currentPage === index + 1
                                                ? "btn-primary"
                                                : "btn-outline-primary"
                                        }`}
                                        onClick={() =>
                                            setCurrentPage(index + 1)
                                        }
                                    >
                                        {index + 1}
                                    </button>
                                )
                            )}

                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    setCurrentPage((page) => page + 1)
                                }
                            >
                                Next
                                <i className="bi bi-chevron-right ms-1"></i>
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default StudentList;
