import { useState, useEffect } from "react";
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Container,
  Paper,
  Grid,
  InputAdornment,
  FormLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Email, Check } from "@mui/icons-material";

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salesAgents, setSalesAgents] = useState([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [agentError, setAgentError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    registrationType: "self",
    companyName: "",
    contactPerson: "",
    email: "",
    phoneNumber: "",
    cashbackPhone: "",
    kraPin: "",
    buildingName: "",
    floorNumber: "",
    roomNumber: "",
    streetName: "",
    areaName: "Westlands (KE)",
    city: "",
    country: "Kenya",
    userType: "individual",
  });

  // Errors state
  const [errors, setErrors] = useState({});

  // Success dialog state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  // Snackbar state for notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch sales agents only when registrationType is 'agent'
  useEffect(() => {
    if (formData.registrationType === "agent") {
      const fetchSalesAgents = async () => {
        setIsLoadingAgents(true);
        setAgentError(null);
        console.log('Fetching sales agents from:', `${import.meta.env.VITE_API_URL}/auth/sales-agents`);
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/sales-agents`);
          console.log('Sales agents response:', response.data);
          setSalesAgents(response.data);
          if (response.data.length > 0) {
            setFormData((prev) => ({
              ...prev,
              salesAgentId: response.data[0].id,
            }));
          }
        } catch (error) {
          console.error('Failed to fetch sales agents:', error);
          setAgentError('Failed to load sales agents. Please try again.');
          setSnackbar({
            open: true,
            message: 'Failed to load sales agents. Please try again.',
            severity: "error",
          });
        } finally {
          setIsLoadingAgents(false);
        }
      };
      fetchSalesAgents();
    } else {
      // Clear sales agent data for self-registration
      setFormData((prev) => {
        const { salesAgentId, ...rest } = prev; // Remove salesAgentId
        return rest;
      });
      setSalesAgents([]);
      setAgentError(null);
    }
  }, [formData.registrationType]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Form field changed: ${name} = ${value}`);
    setFormData({
      ...formData,
      [name]: name === "userType" ? value.toLowerCase() : value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form with formData:', formData);
    console.log('API URL:', import.meta.env.VITE_API_URL);
    setIsSubmitting(true);
    setErrors({});

    // Client-side validation
    const newErrors = {};
    
    if (!formData.companyName.trim()) {
      newErrors.companyName =
        formData.userType === "individual" ? "Individual name is required" : "Company name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^[0-9]{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone must be 9 digits (without +254)";
    }
    
    if (!formData.kraPin.trim()) {
      newErrors.kraPin = "KRA PIN is required";
    } else if (!/^[A-Za-z0-9]{11}$/.test(formData.kraPin)) {
      newErrors.kraPin = "Invalid KRA PIN format (must be 11 alphanumeric characters)";
    }

    if (formData.registrationType === "agent" && !formData.salesAgentId) {
      newErrors.salesAgentId = "Please select a sales agent";
    }

    if (Object.keys(newErrors).length > 0) {
      console.log('Validation errors:', newErrors);
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare the data for backend
      const registrationData = {
        email: formData.email.trim(),
        registrationType: formData.registrationType === "agent" ? "sales_agent" : "self",
        userType: formData.userType,
        name: formData.companyName.trim(),
        contactName: formData.contactPerson.trim() || null,
        phoneNumber: formData.phoneNumber.trim(),
        cashbackPhoneNumber: formData.cashbackPhone.trim() || null,
        kraPin: formData.kraPin.trim(),
        buildingName: formData.buildingName.trim() || null,
        floorNumber: formData.floorNumber.trim() || null,
        roomNumber: formData.roomNumber.trim() || null,
        streetName: formData.streetName.trim() || null,
        areaName: formData.areaName.trim() || null,
        city: formData.city.trim() || null,
        country: formData.country.trim() || null,
      };

      // Only include salesAgentId for agent registration
      if (formData.registrationType === "agent") {
        registrationData.salesAgentId = parseInt(formData.salesAgentId, 10);
      }

      console.log('Submitting registration data:', registrationData);

      // Send to backend
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, registrationData, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('Registration response:', response.data);
      if (response.status === 201) {
        setSuccessDialogOpen(true);
      } else {
        throw new Error(`Registration failed with status: ${response.status}`);
      }

    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection.';
      } else if (error.response) {
        errorMessage = error.response.data?.message || 
          (error.response.data?.errors ? error.response.data.errors.map(e => e.msg).join(', ') : errorMessage);
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    if (Object.values(formData).some(value => value !== "" && value !== "self" && value !== "individual" && value !== "Westlands (KE)" && value !== "Kenya" && value !== null)) {
      if (window.confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  // Handle dialog close and redirect
  const handleDialogClose = () => {
    setSuccessDialogOpen(false);
    navigate("/login");
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
          Create New Customer
        </Typography>

        {agentError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {agentError}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Registration Type Section */}
          <Box mb={3}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Registration Type</FormLabel>
              <RadioGroup row name="registrationType" value={formData.registrationType} onChange={handleChange}>
                <FormControlLabel value="self" control={<Radio />} label="Self Registration" />
                <FormControlLabel value="agent" control={<Radio />} label="Registered by Sales Agent" />
              </RadioGroup>
            </FormControl>

            {formData.registrationType === "agent" && (
              <FormControl fullWidth margin="normal" size="small" error={!!errors.salesAgentId}>
                <Typography variant="body2" gutterBottom>
                  Sales Agent
                </Typography>
                <Select
                  name="salesAgentId"
                  value={formData.salesAgentId || ""}
                  onChange={handleChange}
                  disabled={isLoadingAgents || !!agentError}
                >
                  {isLoadingAgents ? (
                    <MenuItem value="" disabled>
                      Loading agents...
                    </MenuItem>
                  ) : agentError ? (
                    <MenuItem value="" disabled>
                      Error loading agents
                    </MenuItem>
                  ) : salesAgents.length === 0 ? (
                    <MenuItem value="" disabled>
                      No active sales agents available
                    </MenuItem>
                  ) : (
                    salesAgents.map((agent) => (
                      <MenuItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {errors.salesAgentId && (
                  <Typography variant="caption" color="error">
                    {errors.salesAgentId}
                  </Typography>
                )}
              </FormControl>
            )}
          </Box>

          {/* User Type */}
          <Box mb={3}>
            <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
              Type of User
            </Typography>
            <FormControl fullWidth margin="normal" size="small">
              <RadioGroup row name="userType" value={formData.userType} onChange={handleChange}>
                <FormControlLabel value="individual" control={<Radio />} label="Individual" />
                <FormControlLabel value="company" control={<Radio />} label="Company" />
              </RadioGroup>
            </FormControl>
          </Box>

          {/* Account Information */}
          <Box mb={3}>
            <Typography variant="body1" fontWeight="bold" gutterBottom>
              {formData.userType === "individual" ? "Individual Name" : "Company Name"}{" "}
              <Typography component="span" color="error" variant="body2">
                (Please note: Your invoice will be generated in this name)
              </Typography>
            </Typography>
            <TextField
              fullWidth
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder={formData.userType === "individual" ? "Individual Name" : "Company Name"}
              size="small"
              error={!!errors.companyName}
              helperText={errors.companyName}
              margin="normal"
            />

            <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
              Contact Person Name
            </Typography>
            <TextField
              fullWidth
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="Contact Person Name"
              size="small"
              margin="normal"
            />

            <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
              Email
            </Typography>
            <TextField
              fullWidth
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email"
              size="small"
              type="email"
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
            />

            <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
              Phone Number
            </Typography>
            <TextField
              fullWidth
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="XXXXXXXXX"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 0 }}>
                    +254
                  </InputAdornment>
                ),
              }}
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber}
              margin="normal"
            />

            <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
              Cashback Phone Number{" "}
              <Typography component="span" color="error" variant="body2">
                (SAFARICOM MOBILE NUMBER ONLY)
              </Typography>
            </Typography>
            <TextField
              fullWidth
              name="cashbackPhone"
              value={formData.cashbackPhone}
              onChange={handleChange}
              placeholder="XXXXXXXXX"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 0 }}>
                    +254
                  </InputAdornment>
                ),
              }}
              margin="normal"
            />

            <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
              {formData.userType === "individual" ? "Individual" : "Company"} KRA Pin{" "}
              <Typography component="span" color="error" variant="body2">
                (Fill this field to claim VAT)
              </Typography>
            </Typography>
            <TextField
              fullWidth
              name="kraPin"
              value={formData.kraPin}
              onChange={handleChange}
              placeholder="KRA pin"
              size="small"
              error={!!errors.kraPin}
              helperText={errors.kraPin}
              margin="normal"
            />
          </Box>

          {/* Address Information */}
          <Box mb={3}>
            <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
              Building Name
            </Typography>
            <TextField
              fullWidth
              name="buildingName"
              value={formData.buildingName}
              onChange={handleChange}
              placeholder="Building name"
              size="small"
              margin="normal"
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                  Floor Number
                </Typography>
                <TextField
                  fullWidth
                  name="floorNumber"
                  value={formData.floorNumber}
                  onChange={handleChange}
                  placeholder="Floor Number"
                  size="small"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                  Room/Door Number
                </Typography>
                <TextField
                  fullWidth
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  placeholder="Room/Door Number"
                  size="small"
                  margin="normal"
                />
              </Grid>
            </Grid>

            <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
              Street Name
            </Typography>
            <TextField
              fullWidth
              name="streetName"
              value={formData.streetName}
              onChange={handleChange}
              placeholder="Street 1"
              size="small"
              margin="normal"
            />

            <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
              Area Name
            </Typography>
            <FormControl fullWidth margin="normal" size="small">
              <Select name="areaName" value={formData.areaName} onChange={handleChange}>
                <MenuItem value="Westlands (KE)">Westlands (KE)</MenuItem>
                <MenuItem value="Parklands">Parklands</MenuItem>
                <MenuItem value="Kilimani">Kilimani</MenuItem>
                <MenuItem value="Lavington">Lavington</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
              City
            </Typography>
            <TextField
              fullWidth
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              size="small"
              margin="normal"
            />

            <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
              Country
            </Typography>
            <TextField
              fullWidth
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Kenya"
              size="small"
              margin="normal"
              disabled
            />
          </Box>

          {/* Information Alert */}
          <Alert severity="info" sx={{ mt: 3, mb: 3 }}>
            <Typography variant="body2">
              Upon registration, a confirmation email will be sent to your email address with a link to set your password.
            </Typography>
          </Alert>

          {/* Form Actions */}
          <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ px: 4, py: 1 }}
              disabled={isSubmitting || isLoadingAgents || !!agentError}
            >
              {isSubmitting ? <CircularProgress size={24} /> : "Create Customer"}
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              sx={{ px: 4, py: 1 }}
              disabled={isSubmitting || isLoadingAgents}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onClose={handleDialogClose} aria-labelledby="registration-success-dialog">
        <DialogTitle id="registration-success-dialog">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Check color="success" />
            Registration Successful
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Thank you for registering with FirstCraft! Your account has been created successfully.
          </DialogContentText>
          <Box sx={{ display: "flex", alignItems: "center", mt: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
            <Email sx={{ mr: 2, color: "primary.main" }} />
            <DialogContentText>
              A confirmation email has been sent to <strong>{formData.email}</strong> with a link to set your password.
              Please check your inbox and follow the instructions to complete your registration.
            </DialogContentText>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary" variant="contained" autoFocus>
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RegistrationForm;