import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import { jwtDecode } from "jwt-decode";
import Carousel from "react-bootstrap/Carousel";
import Swal from "sweetalert2";
import { API_ENDPOINT } from "./Api";
import Modal from "react-bootstrap/Modal";
import { Form, Row, Col } from "react-bootstrap";
import './carousel.css';


function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Verify if User In-Session in LocalStorage
  useEffect(() => {
    const fetchDecodedUserID = async () => {
      try {
        const response = JSON.parse(localStorage.getItem("token"));
        setUser(response.data);

        const decoded_token = jwtDecode(response.data.token);
        setUser(decoded_token);
      } catch (error) {
        navigate("/login");
      }
    };

    fetchDecodedUserID();
  }, []);

  // Performs Logout Method
  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Fetch and manage users
  const [users, setUsers] = useState([]);
  const userData = JSON.parse(localStorage.getItem("token"));
  const token = userData.data.token;

  const headers = {
    accept: "application/json",
    Authorization: token,
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    if (!token) {
      return;
    }
    try {
      const response = await axios.get(`${API_ENDPOINT}/user`, { headers: headers });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      Swal.fire({
        text: 'Failed to load users.',
        icon: 'error',
      });
    }
  };

  const deleteUser = async (id) => {
    const isConfirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      return result.isConfirmed;
    });

    if (!isConfirm) {
      return;
    }

    try {
      await axios.delete(`${API_ENDPOINT}/user/${id}`, { headers: headers });
      Swal.fire({
        icon: "success",
        text: "Successfully Deleted",
      });
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error("Error deleting user:", error);
      Swal.fire({
        text: error.response?.data?.message || "Failed to delete user.",
        icon: "error",
      });
    }
  };

  // Create User
  const [showCreate, setShowCreate] = useState(false);
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState({});

  const handleCloseCreate = () => {
    setShowCreate(false);
    resetCreateForm();
  };

  const handleShowCreate = () => {
    setShowCreate(true);
    resetCreateForm();
  };

  const resetCreateForm = () => {
    setFullname("");
    setUsername("");
    setPassword("");
    setValidationError({});
  };

  const createUser = async (e) => {
    e.preventDefault();
    const payload = { fullname, username, password };

    try {
      await axios.post(`${API_ENDPOINT}/user`, payload, { headers });
      Swal.fire({
        icon: "success",
        text: "Successfully Added",
      });
      fetchUsers(); // Refresh user list
      handleCloseCreate();
    } catch (error) {
      console.error("Error creating user:", error);
      if (error.response && error.response.status === 422) {
        setValidationError(error.response.data.errors);
      } else {
        Swal.fire({
          text: error.response?.data?.message || "An error occurred",
          icon: "error",
        });
      }
    }
  };

  // Update User
  const [showUpdate, setShowUpdate] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const handleShowUpdate = (user) => {
    setSelectedUser(user);
    setCurrentUserId(user.user_id);
    setFullname(user.fullname);
    setUsername(user.username);
    setPassword("");
    setShowUpdate(true);
  };

  const handleCloseUpdate = () => {
    setShowUpdate(false);
    resetCreateForm();
  };

  const updateUser = async (e) => {
    e.preventDefault();
    const payload = { fullname, username, password };

    try {
      await axios.put(`${API_ENDPOINT}/user/${currentUserId}`, payload, { headers });
      Swal.fire({
        icon: "success",
        text: "Successfully Updated",
      });
      fetchUsers(); // Refresh user list
      handleCloseUpdate();
    } catch (error) {
      console.error("Error updating user:", error);
      if (error.response && error.response.status === 422) {
        setValidationError(error.response.data.errors);
      } else {
        Swal.fire({
          text: error.response?.data?.message || "An error occurred",
          icon: "error",
        });
      }
    }
  };

  return (
    <>
      {/* Navbar */}
      <Navbar bg="light" variant="light" fixed="top">
        <Container>
          <Navbar.Brand href="#home">HotelHub</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="#users">Users</Nav.Link>
            <Nav.Link href="#reservations">Reservations</Nav.Link>
            <Nav.Link href="#explore">Explore</Nav.Link>
          </Nav>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <NavDropdown
                title={user ? `User: ${user.username}` : "Dropdown"}
                id="basic-nav-dropdown"
                align="end"
              >
                <NavDropdown.Item href="#">Profile</NavDropdown.Item>
                <NavDropdown.Item href="#">Settings</NavDropdown.Item>
                <NavDropdown.Item href="#" onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Add padding to avoid Navbar overlap */}
      <div style={{ paddingTop: "80px" }}></div>

      {/* Image Slider */}
       <div className="container">
      {/* Flex container for the separate boxes */}
      <div className="row" style={{ display: "flex", justifyContent: "space-between" }}>
        
        {/* Image Box 1 */}
        <div className="col" style={{ border: "2px solid #ddd", borderRadius: "10px", margin: "10px", padding: "10px" }}>
          <img
            className="d-block"
            src="/images/pexels-pixabay-261169.jpg"
            alt="First slide"
            style={{
              objectFit: "cover",
              height: "200px",
              width: "100%", /* Ensures image takes full container width */
              borderRadius: "8px",
            }}
          />
          <div style={{ padding: "10px", textAlign: "center", color: "#FFFFFF" }}>
            <h3>Welcome to HotelHub</h3>
            <p>Enjoy seamless user management.</p>
          </div>
        </div>

        {/* Image Box 2 */}
        <div className="col" style={{ border: "2px solid #ddd", borderRadius: "10px", margin: "10px", padding: "10px" }}>
          <img
            className="d-block"
            src="/images/pexels-heyho-7031882.jpg"
            alt="Second slide"
            style={{
              objectFit: "cover",
              height: "200px",
              width: "100%", /* Ensures image takes full container width */
              borderRadius: "8px",
            }}
          />
          <div style={{ padding: "10px", textAlign: "center", color: "#FFFFFF" }}>
            <h3>Reservations Made Easy</h3>
            <p>Streamline your hotel bookings.</p>
          </div>
        </div>

        {/* Image Box 3 */}
        <div className="col" style={{ border: "2px solid #ddd", borderRadius: "10px", margin: "10px", padding: "10px" }}>
          <img
            className="d-block"
            src="/images/pexels-pixabay-237371.jpg"
            alt="Third slide"
            style={{
              objectFit: "cover",
              height: "200px",
              width: "100%", /* Ensures image takes full container width */
              borderRadius: "8px",
            }}
          />
          <div style={{ padding: "10px", textAlign: "center", color: "#FFFFFF" }}>
            <h3>Explore More</h3>
            <p>Discover features to enhance your experience.</p>
          </div>
        </div>

      </div>
    </div>
      {/* Show Data */}
      <div className="container mt-4">
        <div className="col-12">
          <Button
            variant="btn btn-primary mb-2 float-end btn-sm me-2"
            onClick={handleShowCreate}
          >
            Create User
          </Button>
        </div>

        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Fullname</th>
              <th>
                <center>Action</center>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 &&
              users.map((user) => (
                <tr key={user.user_id}>
                  <td>{user.user_id}</td>
                  <td>{user.username}</td>
                  <td>{user.fullname}</td>
                  <td>
                    <center>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleShowUpdate(user)}
                      >
                        Read
                      </Button>{" "}
                      &nbsp;
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleShowUpdate(user)}
                      >
                        Update
                      </Button>{" "}
                      &nbsp;
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => deleteUser(user.user_id)}
                      >
                        Delete
                      </Button>
                    </center>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Create User */}
      <Modal show={showCreate} onHide={handleCloseCreate}>
        <Modal.Header closeButton>
          <Modal.Title>Create User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={createUser}>
            <Row>
              <Col md={12}>
                <Form.Group controlId="fullname">
                  <Form.Label>Fullname</Form.Label>
                  <Form.Control
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    isInvalid={!!validationError.fullname}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationError.fullname}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group controlId="username">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    isInvalid={!!validationError.username}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationError.username}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    isInvalid={!!validationError.password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationError.password}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Button variant="primary" type="submit">
                  Create User
                </Button>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal for Update User */}
      <Modal show={showUpdate} onHide={handleCloseUpdate}>
        <Modal.Header closeButton>
          <Modal.Title>Update User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={updateUser}>
            <Row>
              <Col md={12}>
                <Form.Group controlId="fullname">
                  <Form.Label>Fullname</Form.Label>
                  <Form.Control
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    isInvalid={!!validationError.fullname}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationError.fullname}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group controlId="username">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    isInvalid={!!validationError.username}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationError.username}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    isInvalid={!!validationError.password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationError.password}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Button variant="primary" type="submit">
                  Update User
                </Button>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Dashboard;
