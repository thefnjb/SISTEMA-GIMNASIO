import React, { useRef, useState, useCallback } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Alert,
} from "@nextui-org/react";
import Webcam from "react-webcam";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

const ModalPagoComprobante = ({ isOpen, onOpenChange, onUploadComplete }) => {
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [view, setView] = useState("upload");
  const [isProcessing, setIsProcessing] = useState(false);

  const resizeImage = useCallback((base64Str, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = (err) => reject(err);
    });
  }, []);

  const processImage = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Selecciona un archivo de imagen válido.");
      return;
    }
    setIsProcessing(true);
    setError("");
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const resizedDataUrl = await resizeImage(event.target.result);
          setPreview(resizedDataUrl);
          setView("preview");
        } catch {
          setError("No se pudo procesar la imagen.");
        } finally {
          setIsProcessing(false);
        }
      };
      reader.onerror = () => {
        setError("No se pudo leer el archivo.");
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setError("Error al procesar el archivo.");
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) processImage(file);
  };

  const capture = useCallback(async () => {
    if (!webcamRef.current) {
      setError("La cámara no está lista. Espera un momento.");
      return;
    }

    try {
      setIsProcessing(true);
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const resizedImage = await resizeImage(imageSrc);
        setPreview(resizedImage);
        setView("preview");
        setError("");
      } else {
        setError("No se pudo capturar la imagen. Verifica permisos de cámara.");
      }
    } catch {
      setError("Error al capturar la imagen desde la cámara.");
    } finally {
      setIsProcessing(false);
    }
  }, [webcamRef, resizeImage]);

  const handleConfirm = () => {
    if (!preview) {
      setError("No hay imagen para subir. Toma o selecciona una foto primero.");
      return;
    }
    if (onUploadComplete) onUploadComplete(preview);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) processImage(file);
  };

  const resetState = () => {
    setPreview(null);
    setError("");
    setView("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";

    // detener cámara al cerrar el modal
    if (webcamRef.current && webcamRef.current.stream) {
      webcamRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      backdrop="opaque"
      isDismissable={true}
      onClose={resetState}
      autoFocus={false} // evita bucle de foco
      className="z-[9999]"
    >
      <ModalContent>
        {(onClose) => (
          <div className="text-white bg-neutral-900 rounded-xl">
            <ModalHeader className="flex flex-col gap-1">
              <div className="text-2xl font-bold text-center">Subir comprobante</div>
            </ModalHeader>

            <ModalBody className="space-y-4 min-h-[300px]">
              {error && (
                <Alert color="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              {isProcessing && (
                <div className="flex flex-col items-center justify-center h-60">
                  <p className="text-lg font-semibold">Procesando imagen...</p>
                  <p className="text-sm text-gray-400">Esto puede tardar unos segundos.</p>
                </div>
              )}

              {view === "upload" && !isProcessing && (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="flex flex-col items-center justify-center w-full p-8 text-center border-2 border-dashed rounded-lg h-60 border-neutral-600"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <CloudUploadIcon sx={{ fontSize: 48, color: "#9ca3af" }} />
                    <p className="mt-2 font-semibold">Arrastra y suelta una imagen aquí</p>
                    <p className="text-sm text-gray-400">o haz clic para seleccionarla</p>
                  </div>

                  <Button
                    onPress={() => setView("camera")}
                    startContent={<CameraAltIcon sx={{ color: "white" }} />}
                    className="mt-4 text-white bg-transparent border border-neutral-500 hover:bg-neutral-700"
                  >
                    Usar cámara
                  </Button>
                </div>
              )}

              {view === "camera" && (
                <div className="flex flex-col items-center gap-3">
                  <div tabIndex={-1}>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      className="w-full bg-black rounded-md"
                      videoConstraints={{
                        width: 1280,
                        height: 720,
                        facingMode: "user",
                      }}
                    />
                  </div>
                  <Button
                    onPress={capture}
                    className="w-full text-white bg-red-600 hover:bg-red-700"
                  >
                    Capturar Foto
                  </Button>
                </div>
              )}

              {view === "preview" && preview && (
                <div className="flex flex-col items-center gap-3">
                  <p className="font-semibold">Vista Previa</p>
                  <img
                    src={preview}
                    alt="Vista previa del comprobante"
                    className="object-contain w-full rounded-lg max-h-80"
                  />
                  <Button
                    onPress={resetState}
                    variant="light"
                    className="text-sm text-gray-300 hover:text-white"
                  >
                    Cambiar imagen
                  </Button>
                </div>
              )}
            </ModalBody>

            <ModalFooter>
              <Button
                color="default"
                variant="light"
                onPress={onClose}
                className="text-white"
              >
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  handleConfirm();
                  onClose();
                }}
                className="text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-500"
                isDisabled={!preview || isProcessing}
              >
                Confirmar y subir
              </Button>
            </ModalFooter>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ModalPagoComprobante;
