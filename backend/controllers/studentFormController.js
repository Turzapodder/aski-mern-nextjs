import StudentFormModel from '../models/StudentForm.js';
import { v4 as uuidv4 } from 'uuid';

class StudentFormController {
  // Save student form data (for non-logged-in users)
  static saveStudentForm = async (req, res) => {
    try {
      console.log('Received form save request:', {
        body: req.body,
        files: req.files ? req.files.length : 0
      });

      const { sessionId, formData } = req.body;

      if (!sessionId || !formData) {
        console.error('Missing required fields:', { sessionId: !!sessionId, formData: !!formData });
        return res.status(400).json({
          status: 'failed',
          message: 'Session ID and form data are required'
        });
      }

      // Parse formData if it's a string (from FormData)
      let parsedFormData;
      try {
        parsedFormData = typeof formData === 'string' ? JSON.parse(formData) : formData;
      } catch (parseError) {
        console.error('Failed to parse form data:', parseError);
        return res.status(400).json({
          status: 'failed',
          message: 'Invalid form data format'
        });
      }

      // Process attachments if they exist
      let processedFormData = { ...parsedFormData };
      if (req.files && req.files.length > 0) {
        console.log('Processing files:', req.files.map(f => ({ name: f.originalname, size: f.size })));
        processedFormData.attachments = req.files.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          buffer: file.buffer
        }));
      }

      // Check if form already exists for this session
      let studentForm = await StudentFormModel.findOne({ sessionId });

      if (studentForm) {
        console.log('Updating existing form for session:', sessionId);
        // Update existing form
        studentForm.formData = processedFormData;
        studentForm.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Extend expiry
        await studentForm.save();
      } else {
        console.log('Creating new form for session:', sessionId);
        // Create new form
        studentForm = new StudentFormModel({
          sessionId,
          formData: processedFormData
        });
        await studentForm.save();
      }

      console.log('Form saved successfully for session:', sessionId);
      res.status(200).json({
        status: 'success',
        message: 'Form data saved successfully',
        sessionId: studentForm.sessionId
      });

    } catch (error) {
      console.error('Save student form error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to save form data',
        error: error.message
      });
    }
  };

  // Retrieve student form data
  static getStudentForm = async (req, res) => {
    try {
      const { sessionId } = req.params;

      const studentForm = await StudentFormModel.findOne({ 
        sessionId,
        status: 'pending'
      });

      if (!studentForm) {
        return res.status(404).json({
          status: 'failed',
          message: 'Form data not found or expired'
        });
      }

      // Convert buffer data back to base64 for frontend
      let formDataWithFiles = { ...studentForm.formData };
      if (formDataWithFiles.attachments && formDataWithFiles.attachments.length > 0) {
        formDataWithFiles.attachments = formDataWithFiles.attachments.map(attachment => ({
          filename: attachment.filename,
          originalName: attachment.originalName,
          mimetype: attachment.mimetype,
          size: attachment.size,
          buffer: attachment.buffer ? attachment.buffer.toString('base64') : null
        }));
      }

      res.status(200).json({
        status: 'success',
        formData: formDataWithFiles
      });

    } catch (error) {
      console.error('Get student form error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to retrieve form data'
      });
    }
  };

  // Convert form to user assignment (after login)
  static convertFormToAssignment = async (req, res) => {
    try {
      const { sessionId } = req.body;
      const userId = req.user._id;

      const studentForm = await StudentFormModel.findOne({ 
        sessionId,
        status: 'pending'
      });

      if (!studentForm) {
        return res.status(404).json({
          status: 'failed',
          message: 'Form data not found or expired'
        });
      }

      // Update form with user ID and mark as converted
      studentForm.user = userId;
      studentForm.status = 'converted';
      await studentForm.save();

      // Convert buffer data back to base64 for frontend
      let formDataWithFiles = { ...studentForm.formData };
      if (formDataWithFiles.attachments && formDataWithFiles.attachments.length > 0) {
        formDataWithFiles.attachments = formDataWithFiles.attachments.map(attachment => ({
          filename: attachment.filename,
          originalName: attachment.originalName,
          mimetype: attachment.mimetype,
          size: attachment.size,
          buffer: attachment.buffer ? attachment.buffer.toString('base64') : null
        }));
      }

      res.status(200).json({
        status: 'success',
        message: 'Form converted to assignment successfully',
        formData: formDataWithFiles
      });

    } catch (error) {
      console.error('Convert form error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to convert form'
      });
    }
  };

  // Generate session ID for anonymous users
  static generateSessionId = async (req, res) => {
    try {
      const sessionId = uuidv4();
      
      res.status(200).json({
        status: 'success',
        sessionId
      });

    } catch (error) {
      console.error('Generate session ID error:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Unable to generate session ID'
      });
    }
  };
}

export default StudentFormController;