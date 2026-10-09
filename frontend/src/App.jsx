
import Navbar from "./components/Navbar";
import StudentForm from "./components/StudentForm";
import StudentList from "./components/StudentList";
import Footer from "./components/Footer";

function App() {
    return (
        <>
            <Navbar />

            <div className="container py-5">

                {/* Add Student */}
                <div className="row justify-content-center">
                    <div className="col-lg-6">
                        <StudentForm />
                    </div>
                </div>

                {/* Student List */}
                <div className="mt-5">
                    <StudentList />
                </div>

            </div>

            <Footer />
        </>
    );
}

export default App;
