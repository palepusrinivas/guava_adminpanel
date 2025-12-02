"use client";
import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Switch,
    FormControlLabel,
    Chip,
    CircularProgress,
    Alert,
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import {
    createSubscriptionPlan,
    deleteSubscriptionPlan,
    fetchSubscriptionPlans,
    updateSubscriptionPlan,
    SchoolSubscriptionPlan,
} from "@/utils/slices/schoolSlice";
import toast from "react-hot-toast";

const validationSchema = yup.object({
    name: yup.string().required("Name is required"),
    amount: yup.number().required("Amount is required").positive("Amount must be positive"),
    durationDays: yup.number().required("Duration is required").positive("Duration must be positive").integer("Duration must be an integer"),
    description: yup.string().required("Description is required"),
    isActive: yup.boolean(),
});

const SchoolSubscription = () => {
    const dispatch = useAppDispatch();
    const { plans, isLoading, error } = useAppSelector((state) => state.school);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<SchoolSubscriptionPlan | null>(null);
    const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchSubscriptionPlans());
    }, [dispatch]);

    const handleOpen = () => {
        setOpen(true);
        setEditMode(false);
        setSelectedPlan(null);
        formik.resetForm();
    };

    const handleEdit = (plan: SchoolSubscriptionPlan) => {
        setOpen(true);
        setEditMode(true);
        setSelectedPlan(plan);
        formik.setValues(plan);
    };

    const handleClose = () => {
        setOpen(false);
        setEditMode(false);
        setSelectedPlan(null);
        formik.resetForm();
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this plan?")) {
            setDeleteLoading(id);
            const result = await dispatch(deleteSubscriptionPlan(id));
            setDeleteLoading(null);
            if (deleteSubscriptionPlan.fulfilled.match(result)) {
                toast.success("Plan deleted successfully");
            } else {
                toast.error("Failed to delete plan");
            }
        }
    };

    const formik = useFormik({
        initialValues: {
            name: "",
            amount: 0,
            durationDays: 0,
            description: "",
            isActive: true,
        } as Omit<SchoolSubscriptionPlan, "id">,
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            if (editMode && selectedPlan) {
                const result = await dispatch(updateSubscriptionPlan({ id: selectedPlan.id, data: values }));
                if (updateSubscriptionPlan.fulfilled.match(result)) {
                    toast.success("Plan updated successfully");
                    handleClose();
                } else {
                    toast.error("Failed to update plan");
                }
            } else {
                const result = await dispatch(createSubscriptionPlan(values));
                if (createSubscriptionPlan.fulfilled.match(result)) {
                    toast.success("Plan created successfully");
                    handleClose();
                } else {
                    toast.error("Failed to create plan");
                }
            }
        },
    });

    return (
        <Box>
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <Typography variant="h5" className="font-semibold text-gray-800">
                            School Subscription Plans
                        </Typography>
                        <Typography variant="body2" className="text-gray-500 mt-1">
                            Manage subscription plans for school transport services
                        </Typography>
                    </div>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleOpen}
                        sx={{
                            backgroundColor: "#120E43",
                            "&:hover": { backgroundColor: "#0d0a30" },
                            textTransform: "none",
                            borderRadius: "8px",
                            px: 3,
                        }}
                    >
                        Add New Plan
                    </Button>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" className="mb-4" onClose={() => { }}>
                    {error}
                </Alert>
            )}

            {/* Loading State */}
            {isLoading && plans.length === 0 ? (
                <div className="flex justify-center items-center py-20">
                    <CircularProgress sx={{ color: "#120E43" }} size={50} />
                </div>
            ) : (
                <>
                    {/* Plans Table */}
                    {plans.length > 0 ? (
                        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "12px" }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                                        <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Plan Name</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Amount</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Duration</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Description</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: "#374151" }} align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {plans.map((plan) => (
                                        <TableRow
                                            key={plan.id}
                                            hover
                                            sx={{
                                                "&:hover": { backgroundColor: "#f9fafb" },
                                                "&:last-child td": { border: 0 }
                                            }}
                                        >
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {plan.name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600} color="#10B981">
                                                    ₹{plan.amount.toLocaleString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {plan.durationDays} Days
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" className="text-gray-600">
                                                    {plan.description}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={plan.isActive ? "Active" : "Inactive"}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: plan.isActive ? "#D1FAE5" : "#FEE2E2",
                                                        color: plan.isActive ? "#065F46" : "#991B1B",
                                                        fontWeight: 500,
                                                        fontSize: "0.75rem",
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    onClick={() => handleEdit(plan)}
                                                    size="small"
                                                    sx={{ color: "#120E43", mr: 1 }}
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleDelete(plan.id)}
                                                    size="small"
                                                    sx={{ color: "#EF4444" }}
                                                    disabled={deleteLoading === plan.id}
                                                >
                                                    {deleteLoading === plan.id ? (
                                                        <CircularProgress size={20} />
                                                    ) : (
                                                        <Delete fontSize="small" />
                                                    )}
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Paper
                            elevation={0}
                            sx={{
                                border: "1px solid #e5e7eb",
                                borderRadius: "12px",
                                py: 10,
                                textAlign: "center"
                            }}
                        >
                            <div className="flex flex-col items-center">
                                <div className="mb-4">
                                    <svg
                                        className="mx-auto h-16 w-16 text-gray-300"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                                <Typography variant="h6" className="text-gray-700 font-medium mb-2">
                                    No subscription plans yet
                                </Typography>
                                <Typography variant="body2" className="text-gray-500 mb-4">
                                    Get started by creating your first subscription plan
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={handleOpen}
                                    sx={{
                                        backgroundColor: "#120E43",
                                        "&:hover": { backgroundColor: "#0d0a30" },
                                        textTransform: "none",
                                        borderRadius: "8px",
                                        px: 3,
                                    }}
                                >
                                    Create First Plan
                                </Button>
                            </div>
                        </Paper>
                    )}
                </>
            )}

            {/* Create/Edit Dialog */}
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: "12px" }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" fontWeight={600}>
                        {editMode ? "Edit Subscription Plan" : "Create New Plan"}
                    </Typography>
                </DialogTitle>
                <form onSubmit={formik.handleSubmit}>
                    <DialogContent sx={{ pt: 2 }}>
                        <div className="space-y-4">
                            <TextField
                                fullWidth
                                label="Plan Name"
                                name="name"
                                placeholder="e.g., Monthly Plan"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                                helperText={formik.touched.name && formik.errors.name}
                                variant="outlined"
                                size="small"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <TextField
                                    fullWidth
                                    label="Amount (₹)"
                                    name="amount"
                                    type="number"
                                    placeholder="5000"
                                    value={formik.values.amount}
                                    onChange={formik.handleChange}
                                    error={formik.touched.amount && Boolean(formik.errors.amount)}
                                    helperText={formik.touched.amount && formik.errors.amount}
                                    variant="outlined"
                                    size="small"
                                />
                                <TextField
                                    fullWidth
                                    label="Duration (Days)"
                                    name="durationDays"
                                    type="number"
                                    placeholder="30"
                                    value={formik.values.durationDays}
                                    onChange={formik.handleChange}
                                    error={formik.touched.durationDays && Boolean(formik.errors.durationDays)}
                                    helperText={formik.touched.durationDays && formik.errors.durationDays}
                                    variant="outlined"
                                    size="small"
                                />
                            </div>
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                multiline
                                rows={3}
                                placeholder="Describe the plan benefits and features..."
                                value={formik.values.description}
                                onChange={formik.handleChange}
                                error={formik.touched.description && Boolean(formik.errors.description)}
                                helperText={formik.touched.description && formik.errors.description}
                                variant="outlined"
                                size="small"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formik.values.isActive}
                                        onChange={formik.handleChange}
                                        name="isActive"
                                        sx={{
                                            "& .MuiSwitch-switchBase.Mui-checked": {
                                                color: "#120E43",
                                            },
                                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                                backgroundColor: "#120E43",
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Typography variant="body2" className="text-gray-700">
                                        {formik.values.isActive ? "Plan is Active" : "Plan is Inactive"}
                                    </Typography>
                                }
                            />
                        </div>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            onClick={handleClose}
                            sx={{ textTransform: "none", color: "#6B7280" }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isLoading}
                            sx={{
                                backgroundColor: "#120E43",
                                "&:hover": { backgroundColor: "#0d0a30" },
                                textTransform: "none",
                                borderRadius: "8px",
                                px: 3,
                            }}
                            startIcon={isLoading ? <CircularProgress size={20} sx={{ color: "white" }} /> : null}
                        >
                            {editMode ? "Update Plan" : "Create Plan"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default SchoolSubscription;
