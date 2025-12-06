"use client";

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid transparent',
  boxShadow: 24,
  p: 4,
};

export default function DeleteModal({ open, setOpen, title, handleSubmit, description }) {
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md shadow-lg max-w-md mx-auto bg-white">
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
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={handleSubmit}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all"
            >
              Delete
            </button>
            <button
              onClick={handleClose}
              className="border border-red-500 text-red-600 hover:bg-red-500 hover:text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
