"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid transparent",
  boxShadow: 24,
  p: 4,
};

export default function DeleteModal({
  open,
  setOpen,
  title,
  handleSubmit,
  description,
}) {
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={style}
          className="rounded-md shadow-lg max-w-md mx-auto bg-white"
        >
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            className="text-lg font-semibold text-center text-gray-800"
          >
            {title}
          </Typography>
          <Typography
            id="modal-modal-description"
            sx={{ mt: 2 }}
            className="text-sm text-center font-bold text-gray-600"
          >
            {description}
          </Typography>
          <div className="flex justify-center  gap-4 mt-4">
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{
                bgcolor: "#dc2626",
                color: "white",
                "&:hover": { bgcolor: "#b91c1c" },
              }}
            >
              Delete
            </Button>

            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{
                borderColor: "#ef4444",
                color: "#dc2626",
                "&:hover": {
                  bgcolor: "#ef4444",
                  color: "white",
                  borderColor: "#ef4444",
                },
              }}
            >
              Cancel
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
