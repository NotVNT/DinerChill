// Add static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 