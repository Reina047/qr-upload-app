import React, { useState } from 'react';
import './UploadPage.css';

const UploadPage = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    // ⚠️ REMPLACEZ CES VALEURS AVEC VOS INFOS CLOUDINARY
    const cloudName = 'ddyvuqopw'; // À changer
    const uploadPreset = 'qr-uploads'; // À changer

    const handleFileSelect = (event) => {
        const selectedFiles = Array.from(event.target.files);
        setFiles(selectedFiles);
        setMessage('');
    };

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', 'qr-uploads');

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        return response.json();
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            setMessage('Veuillez sélectionner au moins une image');
            return;
        }

        setUploading(true);
        setMessage('');

        try {
            const uploadPromises = files.map(file => uploadToCloudinary(file));
            const results = await Promise.all(uploadPromises);

            setMessage(`✅ ${files.length} image(s) uploadée(s) avec succès !`);
            setFiles([]);
            document.getElementById('file-input').value = '';

        } catch (error) {
            console.error('Upload error:', error);
            setMessage('❌ Échec de l\'upload. Réessayez.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="upload-container">
            <div className="upload-card">
                <h1>📸 Partagez Vos Photos</h1>
                <p className="subtitle">Scannez, uploadez, partagez !</p>

                <div className="upload-area">
                    <input
                        type="file"
                        id="file-input"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="file-input"
                    />
                    <label htmlFor="file-input" className="file-label">
                        📎 Choisir des images
                    </label>

                    {files.length > 0 && (
                        <div className="file-list">
                            <p>Fichiers sélectionnés ({files.length}):</p>
                            <ul>
                                {files.map((file, index) => (
                                    <li key={index}>{file.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleUpload}
                    disabled={uploading || files.length === 0}
                    className="upload-button"
                >
                    {uploading ? 'Upload en cours...' : 'Uploader les images'}
                </button>

                {message && (
                    <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                <div className="instructions">
                    <h3>Comment uploader :</h3>
                    <ol>
                        <li>Cliquez sur "Choisir des images"</li>
                        <li>Sélectionnez une ou plusieurs photos</li>
                        <li>Cliquez sur "Uploader les images"</li>
                        <li>Attendez la confirmation</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default UploadPage;