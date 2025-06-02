// src/app/admin/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import {
  PlusCircleIcon,
  Trash2Icon,
  EditIcon,
  FileTextIcon,
  UploadCloudIcon,
  AlertTriangleIcon,
  // CheckCircle2Icon, // Removed as it was unused
  RefreshCwIcon,
} from "lucide-react";

// More specific type for Firestore Timestamps when fetched to client
type ClientTimestamp =
  | { seconds: number; nanoseconds: number }
  | null
  | undefined;

interface Submission {
  id: string;
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  aadharPhoneNumber?: string;
  hometownLocation?: string;
  bloodGroup?: string;
  email?: string;
  message?: string;
  aadharPhotoUrl?: string | null;
  aadharNumber?: string | null;
  submittedAt?: ClientTimestamp;
  adminUploadedDocUrl?: string | null;
  adminNotes?: Record<string, string> | null;
  lastAdminEditAt?: ClientTimestamp;
}

const AdminDashboardPage = () => {
  const router = useRouter();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [currentAdminNotes, setCurrentAdminNotes] = useState<
    Record<string, string>
  >({});
  const [newNoteKey, setNewNoteKey] = useState("");
  const [newNoteValue, setNewNoteValue] = useState("");
  const [adminDocFile, setAdminDocFile] = useState<File | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] =
    useState<Submission | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdminRole = true;
  const authLoading = false;

  useEffect(() => {
    if (!authLoading && !isAdminRole) {
      setPageError("Access Denied. You must be an admin to view this page.");
      setIsLoadingData(false);
      // router.replace('/admin-login');
    }
  }, [isAdminRole, authLoading, router]);

  const fetchSubmissions = useCallback(
    async (showLoading = true) => {
      if (!isAdminRole) {
        setIsLoadingData(false);
        return;
      }
      if (showLoading) setIsLoadingData(true);
      setPageError(null);
      try {
        const response = await fetch("/api/admin/submissions");
        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Failed to fetch submissions" }));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }
        const data: Submission[] = await response.json();
        setSubmissions(data);
      } catch (err: unknown) {
        // Changed from any
        if (err instanceof Error) {
          setPageError(err.message);
        } else {
          setPageError("An unknown error occurred while fetching submissions.");
        }
      } finally {
        if (showLoading) setIsLoadingData(false);
      }
    },
    [isAdminRole]
  );

  useEffect(() => {
    if (isAdminRole) {
      fetchSubmissions();
    }
  }, [fetchSubmissions, isAdminRole]);

  const handleOpenEditModal = (submission: Submission) => {
    setEditingSubmission({ ...submission });
    setCurrentAdminNotes(submission.adminNotes || {});
    setAdminDocFile(null);
    setNewNoteKey("");
    setNewNoteValue("");
    setPageError(null);
    setIsEditModalOpen(true);
  };

  const handleFieldChange = (field: keyof Submission, value: string) => {
    if (editingSubmission) {
      setEditingSubmission((prev) => {
        if (!prev) return null;
        // Create a new object for the state update
        const updatedSubmission = { ...prev, [field]: value };
        return updatedSubmission;
      });
    }
  };

  const handleAddNote = () => {
    if (newNoteKey.trim() && editingSubmission) {
      setCurrentAdminNotes((prev) => ({
        ...prev,
        [newNoteKey.trim()]: newNoteValue.trim(),
      }));
      setNewNoteKey("");
      setNewNoteValue("");
    } else if (!newNoteKey.trim()) {
      alert("Note label cannot be empty.");
    }
  };

  const handleRemoveNote = (keyToRemove: string) => {
    setCurrentAdminNotes((prev) => {
      const newState = { ...prev };
      delete newState[keyToRemove];
      return newState;
    });
  };

  const handleAdminDocFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAdminDocFile(e.target.files[0]);
    } else {
      setAdminDocFile(null);
    }
  };

  const handleSaveSubmission = async () => {
    if (!editingSubmission) return;
    setIsSaving(true);
    setPageError(null);

    let newAdminDocUrl: string | null =
      editingSubmission.adminUploadedDocUrl || null;

    try {
      if (adminDocFile) {
        const fileFormData = new FormData();
        fileFormData.append("adminDocument", adminDocFile);

        const uploadResponse = await fetch(
          `/api/admin/submissions/${editingSubmission.id}/upload-admin-doc`,
          {
            method: "POST",
            body: fileFormData,
          }
        );

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse
            .json()
            .catch(() => ({ message: "Document upload failed" }));
          throw new Error(errorData.message || "Document upload failed");
        }
        const uploadResult = await uploadResponse.json();
        newAdminDocUrl = uploadResult.fileUrl;
      }

      const updatePayload: Partial<Submission> = {};
      // Construct payload with only changed fields to avoid overwriting with defaults
      (Object.keys(editingSubmission) as Array<keyof Submission>).forEach(
        (key) => {
          if (
            key !== "id" &&
            key !== "submittedAt" &&
            key !== "lastAdminEditAt" &&
            key !== "adminNotes" &&
            key !== "adminUploadedDocUrl"
          ) {
            // Check if the value has actually changed from the original submission
            const originalSubmission = submissions.find(
              (s) => s.id === editingSubmission.id
            );
            if (
              originalSubmission &&
              editingSubmission[key] !== originalSubmission[key]
            ) {
              (updatePayload as any)[key] = editingSubmission[key];
            } else if (
              !originalSubmission &&
              editingSubmission[key] !== undefined
            ) {
              // New field or not in original list
              (updatePayload as any)[key] = editingSubmission[key];
            }
          }
        }
      );

      updatePayload.adminNotes = currentAdminNotes;
      updatePayload.adminUploadedDocUrl = newAdminDocUrl;

      if (Object.keys(updatePayload).length === 0) {
        // Check if only notes or doc URL changed
        const originalSubmission = submissions.find(
          (s) => s.id === editingSubmission.id
        );
        const notesChanged =
          JSON.stringify(currentAdminNotes) !==
          JSON.stringify(originalSubmission?.adminNotes || {});
        const docChanged =
          newAdminDocUrl !== (originalSubmission?.adminUploadedDocUrl || null);

        if (!notesChanged && !docChanged) {
          alert("No changes detected to save.");
          setIsSaving(false);
          setIsEditModalOpen(false);
          return;
        }
      }

      const updateResponse = await fetch(
        `/api/admin/submissions/${editingSubmission.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse
          .json()
          .catch(() => ({ message: "Failed to save submission" }));
        throw new Error(errorData.message || "Failed to save submission");
      }

      alert("Submission updated successfully!");
      setIsEditModalOpen(false);
      fetchSubmissions(false);
    } catch (err: unknown) {
      // Changed from any
      if (err instanceof Error) {
        setPageError(`Save failed: ${err.message}`);
      } else {
        setPageError("An unknown error occurred during save.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirmation = (submission: Submission) => {
    setSubmissionToDelete(submission);
    setShowDeleteConfirm(true);
  };

  const handleDeleteSubmission = async () => {
    if (!submissionToDelete) return;
    setIsDeleting(true);
    setPageError(null);

    try {
      const response = await fetch(
        `/api/admin/submissions/${submissionToDelete.id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to delete submission" }));
        throw new Error(errorData.message || "Failed to delete submission");
      }
      alert("Submission deleted successfully!");
      setShowDeleteConfirm(false);
      setSubmissionToDelete(null);
      fetchSubmissions(false);
    } catch (err: unknown) {
      // Changed from any
      if (err instanceof Error) {
        setPageError(`Delete failed: ${err.message}`);
      } else {
        setPageError("An unknown error occurred during delete.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTimestamp = (timestamp: ClientTimestamp): string => {
    if (!timestamp) return "N/A";
    try {
      // Check if it's a Firestore-like timestamp object from server
      if (
        typeof timestamp === "object" &&
        "seconds" in timestamp &&
        "nanoseconds" in timestamp
      ) {
        return new Date(
          timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
        ).toLocaleString();
      }
      // Fallback for Date objects or parseable date strings
      const date = new Date(timestamp as string | number | Date); // Cast for Date constructor
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleString();
    } catch {
      return "Invalid Date Object";
    }
  };

  if (
    authLoading ||
    (isLoadingData && submissions.length === 0 && !pageError && isAdminRole)
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <RefreshCwIcon className="w-8 h-8 animate-spin text-primary" />
        <p className="text-lg ml-3">Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (!isAdminRole && !authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <AlertTriangleIcon className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive mb-2">
          Access Denied
        </h1>
        <p className="text-muted-foreground mb-6">
          {pageError ||
            "You do not have permission to view this page. Please log in as an administrator."}
        </p>
        {/* <Button onClick={() => router.push('/admin-login')}>Go to Admin Login</Button> */}
      </div>
    );
  }

  if (pageError && submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <AlertTriangleIcon className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive mb-2">
          Error Loading Data
        </h1>
        <p className="text-muted-foreground mb-6">{pageError}</p>
        <Button onClick={() => fetchSubmissions(true)} disabled={isLoadingData}>
          {isLoadingData ? (
            <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCwIcon className="w-4 h-4 mr-2" />
          )}
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">
          Admin Dashboard - Submissions
        </h1>
        <Button onClick={() => fetchSubmissions(true)} disabled={isLoadingData}>
          {isLoadingData ? (
            <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCwIcon className="w-4 h-4 mr-2" />
          )}
          Refresh Data
        </Button>
      </header>

      {pageError && ( // Display error as a banner if data is already present or modal error
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded-md flex items-center gap-2">
          <AlertTriangleIcon className="w-5 h-5 flex-shrink-0" />
          <p>
            <strong>Error:</strong> {pageError}
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableCaption>
            {submissions.length === 0 && !isLoadingData
              ? "No submissions found."
              : submissions.length > 0
              ? "A list of user submissions."
              : "Loading submissions..."}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[180px]">Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Hometown</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead className="text-center">Aadhar Photo</TableHead>
              <TableHead className="text-center">Admin Doc</TableHead>
              <TableHead className="text-right min-w-[120px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell className="font-medium">
                  {submission.firstName} {submission.lastName}
                </TableCell>
                <TableCell>{submission.aadharPhoneNumber || "N/A"}</TableCell>
                <TableCell>{submission.hometownLocation || "N/A"}</TableCell>
                <TableCell>{formatTimestamp(submission.submittedAt)}</TableCell>
                <TableCell className="text-center">
                  {submission.aadharPhotoUrl ? (
                    <a
                      href={submission.aadharPhotoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      <FileTextIcon className="inline h-5 w-5" />
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">N/A</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {submission.adminUploadedDocUrl ? (
                    <a
                      href={submission.adminUploadedDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      <FileTextIcon className="inline h-5 w-5" />
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">N/A</span>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleOpenEditModal(submission)}
                    title="Edit"
                  >
                    <EditIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteConfirmation(submission)}
                    title="Delete"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {isEditModalOpen && editingSubmission && (
        <Dialog
          open={isEditModalOpen}
          onOpenChange={(isOpen) => {
            if (!isSaving) {
              setIsEditModalOpen(isOpen);
              if (!isOpen) setPageError(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-2xl md:max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                Edit Submission: {editingSubmission.firstName}{" "}
                {editingSubmission.lastName}
              </DialogTitle>
              {pageError && ( // Show modal specific errors here
                <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md mt-2">
                  {pageError}
                </p>
              )}
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto p-1 pr-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="editFirstName"
                    className="text-sm font-medium"
                  >
                    First Name
                  </label>
                  <Input
                    id="editFirstName"
                    value={editingSubmission.firstName || ""}
                    onChange={(e) =>
                      handleFieldChange("firstName", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="editLastName" className="text-sm font-medium">
                    Last Name
                  </label>
                  <Input
                    id="editLastName"
                    value={editingSubmission.lastName || ""}
                    onChange={(e) =>
                      handleFieldChange("lastName", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="editFatherName"
                    className="text-sm font-medium"
                  >
                    Father&apos;s Name
                  </label>
                  <Input
                    id="editFatherName"
                    value={editingSubmission.fatherName || ""}
                    onChange={(e) =>
                      handleFieldChange("fatherName", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="editAadharPhoneNumber"
                    className="text-sm font-medium"
                  >
                    Aadhar Phone
                  </label>
                  <Input
                    id="editAadharPhoneNumber"
                    value={editingSubmission.aadharPhoneNumber || ""}
                    onChange={(e) =>
                      handleFieldChange("aadharPhoneNumber", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="editHometownLocation"
                    className="text-sm font-medium"
                  >
                    Hometown
                  </label>
                  <Input
                    id="editHometownLocation"
                    value={editingSubmission.hometownLocation || ""}
                    onChange={(e) =>
                      handleFieldChange("hometownLocation", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="editBloodGroup"
                    className="text-sm font-medium"
                  >
                    Blood Group
                  </label>
                  <Input
                    id="editBloodGroup"
                    value={editingSubmission.bloodGroup || ""}
                    onChange={(e) =>
                      handleFieldChange("bloodGroup", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="editEmail" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editingSubmission.email || ""}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="editAadharNumber"
                    className="text-sm font-medium"
                  >
                    Aadhar Number
                  </label>
                  <Input
                    id="editAadharNumber"
                    value={editingSubmission.aadharNumber || ""}
                    onChange={(e) =>
                      handleFieldChange("aadharNumber", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="editMessage" className="text-sm font-medium">
                  Original Message
                </label>
                <Textarea
                  id="editMessage"
                  value={editingSubmission.message || ""}
                  onChange={(e) => handleFieldChange("message", e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="mt-4 border-t pt-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <UploadCloudIcon className="w-5 h-5" /> Admin Document
                </h3>
                {editingSubmission.adminUploadedDocUrl && (
                  <div className="mb-2 text-sm">
                    Current:{" "}
                    <a
                      href={editingSubmission.adminUploadedDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {editingSubmission.adminUploadedDocUrl
                        .split("/")
                        .pop()
                        ?.substring(0, 30) + "..."}
                    </a>
                  </div>
                )}
                <label
                  htmlFor="adminDoc"
                  className="text-sm font-medium block mb-1"
                >
                  Upload New/Replace (PDF)
                </label>
                <Input
                  id="adminDoc"
                  type="file"
                  accept=".pdf"
                  onChange={handleAdminDocFileChange}
                />
                {adminDocFile && (
                  <p className="text-xs mt-1 text-muted-foreground">
                    Selected: {adminDocFile.name}
                  </p>
                )}
              </div>

              <div className="mt-4 border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Additional Notes</h3>
                {Object.entries(currentAdminNotes).length > 0 ? (
                  Object.entries(currentAdminNotes).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 mb-2">
                      <Input
                        value={key}
                        disabled
                        className="font-semibold bg-muted/50 flex-1"
                      />
                      <Textarea
                        value={value}
                        onChange={(e) =>
                          setCurrentAdminNotes((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        className="flex-[2]"
                        rows={1}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveNote(key)}
                        title="Remove Note"
                      >
                        <Trash2Icon className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No additional notes yet.
                  </p>
                )}
                <div className="flex items-end gap-2 mt-4 border-t pt-3">
                  <div className="flex-1">
                    <label htmlFor="newNoteKey" className="text-xs font-medium">
                      New Note Label
                    </label>
                    <Input
                      id="newNoteKey"
                      placeholder="Label"
                      value={newNoteKey}
                      onChange={(e) => setNewNoteKey(e.target.value)}
                    />
                  </div>
                  <div className="flex-[2]">
                    <label
                      htmlFor="newNoteValue"
                      className="text-xs font-medium"
                    >
                      Note Content
                    </label>
                    <Input
                      id="newNoteValue"
                      placeholder="Content"
                      value={newNoteValue}
                      onChange={(e) => setNewNoteValue(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleAddNote}
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    <PlusCircleIcon className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  disabled={isSaving}
                  onClick={() => setPageError(null)}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={handleSaveSubmission} disabled={isSaving}>
                {isSaving ? (
                  <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showDeleteConfirm && submissionToDelete && (
        <Dialog
          open={showDeleteConfirm}
          onOpenChange={(isOpen) => {
            if (!isDeleting) {
              setShowDeleteConfirm(isOpen);
              if (!isOpen) setPageError(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangleIcon className="text-destructive" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription className="pt-2">
                Are you sure you want to delete the submission for{" "}
                {submissionToDelete.firstName} {submissionToDelete.lastName}?
                This action cannot be undone. Associated files (Aadhar photo,
                Admin document) will also be attempted to be deleted from
                storage.
              </DialogDescription>
            </DialogHeader>
            {pageError && (
              <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md mt-2">
                {pageError}
              </p>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setPageError(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSubmission}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminDashboardPage;
