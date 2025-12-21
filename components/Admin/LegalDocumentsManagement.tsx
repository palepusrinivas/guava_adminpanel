"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppSelector, useAppDispatch } from "@/utils/store/store";
import {
  getLegalDocuments,
  createLegalDocument,
  updateLegalDocument,
  deleteLegalDocument,
  activateLegalDocument,
  deactivateLegalDocument,
} from "@/utils/reducers/adminReducers";
import toast from "react-hot-toast";

interface LegalDocument {
  id?: number;
  documentType: "PRIVACY_POLICY" | "TERMS_CONDITIONS" | "RATE_CARD";
  targetAudience: "USER" | "DRIVER" | "BOTH";
  title: string;
  content: string;
  version?: number;
  active?: boolean;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

const validationSchema = yup.object({
  documentType: yup.string().required("Document type is required"),
  targetAudience: yup.string().required("Target audience is required"),
  title: yup.string().required("Title is required").max(200, "Title must be less than 200 characters"),
  content: yup.string().required("Content is required"),
});

function LegalDocumentsManagement() {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.admin);
  
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<LegalDocument | null>(null);
  const [viewingDocument, setViewingDocument] = useState<LegalDocument | null>(null);
  const [filterType, setFilterType] = useState<"PRIVACY_POLICY" | "TERMS_CONDITIONS" | "RATE_CARD" | "ALL">("ALL");
  const [filterAudience, setFilterAudience] = useState<"USER" | "DRIVER" | "BOTH" | "ALL">("ALL");

  useEffect(() => {
    fetchDocuments();
  }, [filterType, filterAudience]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterType !== "ALL") params.documentType = filterType;
      if (filterAudience !== "ALL") params.targetAudience = filterAudience;
      
      const result = await dispatch(getLegalDocuments(params));
      if (getLegalDocuments.fulfilled.match(result)) {
        setDocuments(Array.isArray(result.payload) ? result.payload : []);
      } else {
        toast.error(result.payload as string || "Failed to fetch documents");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik<LegalDocument>({
    initialValues: {
      documentType: "PRIVACY_POLICY",
      targetAudience: "USER",
      title: "",
      content: "",
      active: true,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        let result;
        
        if (editingDocument?.id) {
          result = await dispatch(updateLegalDocument({
            id: editingDocument.id.toString(),
            documentData: values
          }));
        } else {
          result = await dispatch(createLegalDocument(values));
        }
        
        if (createLegalDocument.fulfilled.match(result) || updateLegalDocument.fulfilled.match(result)) {
          toast.success(editingDocument ? "Document updated successfully!" : "Document created successfully!");
          formik.resetForm();
          setDialogOpen(false);
          setEditingDocument(null);
          fetchDocuments();
        } else {
          toast.error(result.payload as string || "Failed to save document");
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to save document");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleEdit = (doc: LegalDocument) => {
    setEditingDocument(doc);
    formik.setValues({
      documentType: doc.documentType,
      targetAudience: doc.targetAudience,
      title: doc.title,
      content: doc.content,
      active: doc.active ?? true,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    
    try {
      setLoading(true);
      const result = await dispatch(deleteLegalDocument(id.toString()));
      if (deleteLegalDocument.fulfilled.match(result)) {
        toast.success("Document deleted successfully!");
        fetchDocuments();
      } else {
        toast.error(result.payload as string || "Failed to delete document");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete document");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (doc: LegalDocument) => {
    if (!doc.id) return;
    
    try {
      setLoading(true);
      const result = doc.active
        ? await dispatch(deactivateLegalDocument(doc.id.toString()))
        : await dispatch(activateLegalDocument(doc.id.toString()));
      
      if (activateLegalDocument.fulfilled.match(result) || deactivateLegalDocument.fulfilled.match(result)) {
        toast.success(`Document ${doc.active ? "deactivated" : "activated"} successfully!`);
        fetchDocuments();
      } else {
        toast.error(result.payload as string || "Failed to update document");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update document");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (doc: LegalDocument) => {
    setViewingDocument(doc);
    setViewDialogOpen(true);
  };

  const handleNewDocument = () => {
    setEditingDocument(null);
    formik.resetForm();
    formik.setValues({
      documentType: filterType !== "ALL" ? filterType : "PRIVACY_POLICY",
      targetAudience: filterAudience !== "ALL" ? filterAudience : "USER",
      title: "",
      content: "",
      active: true,
    });
    setDialogOpen(true);
  };

  const filteredDocuments = documents.filter((doc) => {
    if (filterType !== "ALL" && doc.documentType !== filterType) return false;
    if (filterAudience !== "ALL" && doc.targetAudience !== filterAudience) return false;
    return true;
  });

  const groupedDocuments = filteredDocuments.reduce((acc, doc) => {
    const key = `${doc.documentType}_${doc.targetAudience}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(doc);
    return acc;
  }, {} as Record<string, LegalDocument[]>);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        📄 Legal Documents Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage Privacy Policy, Terms & Conditions, and Rate Card for Users and Drivers
      </Typography>

      {/* Filters and Actions */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Document Type</InputLabel>
              <Select
                value={filterType}
                label="Document Type"
                onChange={(e) => setFilterType(e.target.value as any)}
              >
                <MenuItem value="ALL">All Types</MenuItem>
                <MenuItem value="PRIVACY_POLICY">Privacy Policy</MenuItem>
                <MenuItem value="TERMS_CONDITIONS">Terms & Conditions</MenuItem>
                <MenuItem value="RATE_CARD">Rate Card</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Target Audience</InputLabel>
              <Select
                value={filterAudience}
                label="Target Audience"
                onChange={(e) => setFilterAudience(e.target.value as any)}
              >
                <MenuItem value="ALL">All Audiences</MenuItem>
                <MenuItem value="USER">Users</MenuItem>
                <MenuItem value="DRIVER">Drivers</MenuItem>
                <MenuItem value="BOTH">Both</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNewDocument}
              fullWidth
            >
              Create New Document
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Documents List */}
      {loading && !documents.length ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : filteredDocuments.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No documents found
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewDocument}
            sx={{ mt: 2 }}
          >
            Create First Document
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {Object.entries(groupedDocuments).map(([key, docs]) => {
            // Get type and audience from the first document (all docs in group have same type/audience)
            const docType = docs[0]?.documentType || "";
            const docAudience = docs[0]?.targetAudience || "";
            const activeDoc = docs.find((d) => d.active);
            
            return (
              <Grid item xs={12} md={6} key={key}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Box>
                        <Typography variant="h6">
                          {docType === "PRIVACY_POLICY" 
                            ? "🔒 Privacy Policy" 
                            : docType === "TERMS_CONDITIONS"
                            ? "📋 Terms & Conditions"
                            : docType === "RATE_CARD"
                            ? "💰 Rate Card"
                            : "📄 Document"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          For: {docAudience === "USER" ? "Users" : docAudience === "DRIVER" ? "Drivers" : "Both"}
                        </Typography>
                      </Box>
                      {activeDoc && (
                        <Chip
                          label="Active"
                          color="success"
                          size="small"
                          icon={<CheckCircleIcon />}
                        />
                      )}
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {docs.length} version{docs.length !== 1 ? "s" : ""} available
                    </Typography>
                    
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {docs.map((doc) => (
                        <Card
                          key={doc.id}
                          variant="outlined"
                          sx={{
                            p: 1.5,
                            flex: 1,
                            minWidth: "200px",
                            border: doc.active ? "2px solid" : "1px solid",
                            borderColor: doc.active ? "success.main" : "divider",
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                            <Box>
                              <Typography variant="subtitle2">
                                Version {doc.version || "N/A"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {doc.title}
                              </Typography>
                            </Box>
                            {doc.active && (
                              <Chip label="Active" color="success" size="small" />
                            )}
                          </Box>
                          
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                            Updated: {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : "N/A"}
                          </Typography>
                          
                          <Box display="flex" gap={0.5} flexWrap="wrap">
                            <IconButton
                              size="small"
                              onClick={() => handleView(doc)}
                              title="View"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(doc)}
                              title="Edit"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleActive(doc)}
                              title={doc.active ? "Deactivate" : "Activate"}
                              color={doc.active ? "default" : "success"}
                            >
                              {doc.active ? <CancelIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => doc.id && handleDelete(doc.id)}
                              title="Delete"
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Card>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingDocument ? "Edit Document" : "Create New Document"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Document Type</InputLabel>
                  <Select
                    name="documentType"
                    value={formik.values.documentType}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.documentType && Boolean(formik.errors.documentType)}
                    label="Document Type"
                  >
                    <MenuItem value="PRIVACY_POLICY">Privacy Policy</MenuItem>
                    <MenuItem value="TERMS_CONDITIONS">Terms & Conditions</MenuItem>
                    <MenuItem value="RATE_CARD">Rate Card</MenuItem>
                  </Select>
                  {formik.touched.documentType && formik.errors.documentType && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {formik.errors.documentType}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Target Audience</InputLabel>
                  <Select
                    name="targetAudience"
                    value={formik.values.targetAudience}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.targetAudience && Boolean(formik.errors.targetAudience)}
                    label="Target Audience"
                  >
                    <MenuItem value="USER">Users</MenuItem>
                    <MenuItem value="DRIVER">Drivers</MenuItem>
                    <MenuItem value="BOTH">Both</MenuItem>
                  </Select>
                  {formik.touched.targetAudience && formik.errors.targetAudience && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {formik.errors.targetAudience}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="title"
                  label="Title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="content"
                  label="Content (HTML supported)"
                  multiline
                  rows={12}
                  value={formik.values.content}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.content && Boolean(formik.errors.content)}
                  helperText={formik.touched.content && formik.errors.content || "You can use HTML formatting"}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : editingDocument ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {viewingDocument?.documentType === "PRIVACY_POLICY" 
            ? "🔒 Privacy Policy" 
            : viewingDocument?.documentType === "TERMS_CONDITIONS"
            ? "📋 Terms & Conditions"
            : "💰 Rate Card"}
          {" - "}
          {viewingDocument?.targetAudience === "USER" ? "Users" : 
           viewingDocument?.targetAudience === "DRIVER" ? "Drivers" : "Both"}
        </DialogTitle>
        <DialogContent>
          {viewingDocument && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {viewingDocument.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Version {viewingDocument.version} | 
                Updated: {viewingDocument.updatedAt ? new Date(viewingDocument.updatedAt).toLocaleString() : "N/A"}
                {viewingDocument.updatedBy && ` | By: ${viewingDocument.updatedBy}`}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  p: 2,
                  bgcolor: "grey.50",
                  borderRadius: 1,
                  maxHeight: "400px",
                  overflowY: "auto",
                }}
                dangerouslySetInnerHTML={{ __html: viewingDocument.content }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default LegalDocumentsManagement;
