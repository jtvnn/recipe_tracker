import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Image, Spinner } from 'react-bootstrap';

const RecipeModal = ({ show, handleClose, handleSave, initialData }) => {
  const [form, setForm] = useState({
    name: '',
    ingredients: '',
    instructions: '',
    imageUrl: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        ingredients: initialData.ingredients || '',
        instructions: initialData.instructions || '',
        imageUrl: initialData.imageUrl || '',
      });
      setPreviewUrl(initialData.imageUrl || '');
    } else {
      setForm({ name: '', ingredients: '', instructions: '', imageUrl: '' });
      setPreviewUrl('');
    }
    setImageFile(null);
    setUploading(false);
  }, [initialData, show]);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return '';
    setUploading(true);
    const formData = new FormData();
    formData.append('image', imageFile);
    // Use /api/upload in production, /upload in dev/local
    const isProd = window.location.hostname.includes('vercel.app') || window.location.hostname.includes('render.com');
    const uploadUrl = isProd ? '/api/upload' : 'http://localhost:4000/upload';
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        credentials: 'include',
      });
      const data = await res.json();
      setUploading(false);
      if (data.imageUrl) {
        setForm(f => ({ ...f, imageUrl: data.imageUrl }));
      }
      return data.imageUrl || '';
    } catch (err) {
      setUploading(false);
      alert('Image upload failed.');
      return '';
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = form.imageUrl;
    if (imageFile) {
      imageUrl = await uploadImage();
    }
    handleSave({ ...form, imageUrl });
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{initialData ? 'Edit Recipe' : 'Add Recipe'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit} encType="multipart/form-data">
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Recipe Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Ingredients</Form.Label>
            <Form.Control
              as="textarea"
              name="ingredients"
              value={form.ingredients}
              onChange={onChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Instructions</Form.Label>
            <Form.Control
              as="textarea"
              name="instructions"
              value={form.instructions}
              onChange={onChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Recipe Image</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={onImageChange}
            />
            {uploading && (
              <div className="mt-2"><Spinner animation="border" size="sm" /> Uploading...</div>
            )}
            {/* Show preview if uploading or new file, otherwise show actual uploaded image if available */}
            {uploading && previewUrl && (
              <div className="mt-2">
                <Image src={previewUrl} alt="Preview" thumbnail style={{ maxHeight: 200 }} />
              </div>
            )}
            {!uploading && form.imageUrl && (
              <div className="mt-2">
                <Image
                  src={form.imageUrl.startsWith('http') ? form.imageUrl : `/uploads/${form.imageUrl}`}
                  alt="Recipe"
                  thumbnail
                  style={{ maxHeight: 200 }}
                />
              </div>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={uploading}>
            Save
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default RecipeModal;
