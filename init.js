import app from "./src/app";

const PORT = 8080;

const handleListening = () => console.log(`🚀 listening on ${PORT}`);

app.listen(PORT, handleListening);
