import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, AlertCircle, Sparkles, Sliders, ChevronRight, FileText, CheckCircle2 } from 'lucide-react';

export default function Scanner({ user, onNewScan }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [engine, setEngine] = useState('local_cnn');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Camera settings
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Attach stream to video element when it becomes active and ref is ready
  useEffect(() => {
    if (cameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraActive, stream]);

  // Clean up stream on unmount or when stream changes
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Start Camera
  const startCamera = async () => {
    setErrorMsg(null);
    setScanResult(null);
    setPreviewUrl(null);
    setSelectedFile(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 }
      });
      setStream(mediaStream);
      setCameraActive(true);
    } catch (err) {
      setErrorMsg("Could not access your camera device. Please upload an image instead.");
    }
  };

  // Capture Frame
  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        stopCamera();
      }, "image/jpeg", 0.95);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    } else if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // File picker handler
  const handleFileChange = (e) => {
    setErrorMsg(null);
    setScanResult(null);
    stopCamera();
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Submit scan request
  const runDiagnosis = async () => {
    if (!selectedFile) {
      setErrorMsg("Please select or capture a skin lesion image first.");
      return;
    }

    setIsScanning(true);
    setErrorMsg(null);
    setScanResult(null);

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("engine", engine);

    try {
      const res = await fetch("/predict", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setScanResult(data);
        if (onNewScan) onNewScan(); // Triggers parent state updates
      } else {
        setErrorMsg(data.message || "AI engine processing failed.");
      }
    } catch (err) {
      setErrorMsg("Failed to communicate with diagnostic API endpoints.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 md:pb-0">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">AI Lesion Scanner</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Perform a real-time skin scan using the active engine.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Image Uploader / Camera */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-5 space-y-4">
            <h4 className="font-extrabold text-slate-800 dark:text-white">Diagnostic Source</h4>

            {/* Toggle Source Buttons */}
            <div className="flex gap-2">
              <button
                onClick={startCamera}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${cameraActive
                  ? 'bg-indigo-600 border-transparent text-white'
                  : 'bg-slate-100 dark:bg-slate-800/30 border-slate-200 dark:border-[#1f293d] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800/60'
                  }`}
              >
                <Camera size={16} />
                <span>Camera Stream</span>
              </button>

              <label className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-[#1f293d] bg-slate-100 dark:bg-slate-800/30 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800/60 cursor-pointer transition-all">
                <Upload size={16} />
                <span>Upload Scan</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Viewport Frame */}
            <div className="relative aspect-video rounded-2xl bg-slate-950 border border-[#1f293d] overflow-hidden flex items-center justify-center">
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {/* Neon Target Reticle */}
                  <div className="absolute inset-0 border-[3px] border-indigo-500/20 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-indigo-400/60 rounded-full border-dashed animate-spin duration-[20s] relative">
                      <div className="absolute -top-1.5 left-1/2 w-3 h-3 bg-indigo-400 rounded-full -translate-x-1/2 shadow-lg shadow-indigo-500/80" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                    <button
                      onClick={captureFrame}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black py-2.5 px-6 rounded-full border border-indigo-400/40 shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
                    >
                      Capture Photo
                    </button>
                    <button
                      onClick={stopCamera}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-extrabold py-2.5 px-4 rounded-full border border-[#1f293d] transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : previewUrl ? (
                <div className="relative w-full h-full">
                  <img
                    src={previewUrl}
                    alt="Scan target preview"
                    className="w-full h-full object-cover"
                  />
                  {/* Glowing Animated Scanline */}
                  {isScanning && (
                    <div className="absolute inset-x-0 h-1 bg-indigo-500 shadow-lg shadow-indigo-500/80 animate-scanline" />
                  )}
                </div>
              ) : (
                <div className="text-center p-6 max-w-sm">
                  <Camera size={36} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">
                    Trigger the webcam camera targeting frame, or choose a high-resolution skin scan upload.
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2.5 text-red-400">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p className="text-xs font-bold leading-normal">{errorMsg}</p>
              </div>
            )}

            {/* Diagnostic trigger */}
            {previewUrl && !isScanning && !scanResult && (
              <button
                onClick={runDiagnosis}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 border border-indigo-400/20"
              >
                <Sparkles size={14} />
                <span>Run Clinical Analysis</span>
              </button>
            )}

            {isScanning && (
              <div className="w-full py-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-extrabold flex items-center justify-center gap-2 select-none">
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <span>Analyzing Skin Anomalies...</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Engine Selectors & Clinical Results */}
        <div className="lg:col-span-5 space-y-6">
          {/* Models/Engine Selector */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#1f293d] pb-3">
              <Sliders size={18} className="text-indigo-600 dark:text-indigo-400" />
              <h4 className="font-extrabold text-slate-800 dark:text-white">Diagnostic AI Core</h4>
            </div>

            <div className="space-y-4 pt-2">
              {[
                { id: 'local_cnn', title: "DermShield Local CNN", desc: "Local TensorFlow Keras weights (Fast & Offline)" },
                { id: 'ensemble', title: "Ensemble AI (ResNet + MobileNet)", desc: "Parallel weighted predictions with mock variances" },
                { id: 'gemini', title: "Gemini 1.5 Multimodal API", desc: "Cloud vision intelligence with semantic reasoning" },
                { id: 'openai', title: "OpenAI GPT-4o Vision API", desc: "Advanced GPT vision diagnostics" }
              ].map((modelOpt) => (
                <div
                  key={modelOpt.id}
                  onClick={() => !isScanning && setEngine(modelOpt.id)}
                  className={`cursor-pointer group transition-opacity ${isScanning ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <p className={`text-sm font-extrabold leading-none transition-colors ${engine === modelOpt.id
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-700 dark:text-slate-200 group-hover:text-indigo-500 dark:group-hover:text-indigo-300'
                    }`}>
                    {engine === modelOpt.id ? '> ' : ''}{modelOpt.title}
                  </p>
                  <p className={`text-[11px] mt-1.5 font-medium leading-tight transition-colors ${engine === modelOpt.id
                    ? 'text-indigo-500/80 dark:text-indigo-400/80'
                    : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}>
                    {modelOpt.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Results display */}
          {scanResult && (
            <div className="glass-panel p-5 space-y-4 animate-scale-up">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#1f293d] pb-3 text-emerald-500 dark:text-emerald-400">
                <CheckCircle2 size={18} />
                <h4 className="font-extrabold text-slate-800 dark:text-white">Assessment Complete</h4>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider">Primary Diagnosis</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">{scanResult.result}</h3>
                  <span className={`text-[10px] font-black border rounded-full px-2 py-0.5 uppercase tracking-wide ${scanResult.severity.toLowerCase() === 'high'
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 dark:text-rose-400'
                    : scanResult.severity.toLowerCase() === 'medium'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    }`}>
                    {scanResult.severity} Severity
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-[#1f293d] rounded-xl">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                  {scanResult.description}
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider">Clinical Care Advice</p>
                {scanResult.advice.map((adv, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 leading-normal">
                    <ChevronRight size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <span>{adv}</span>
                  </div>
                ))}
              </div>

              {scanResult.scan_id && (
                <a
                  href={`/download_report/${scanResult.scan_id}`}
                  className="w-full py-2.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-transparent text-xs font-black shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <FileText size={14} />
                  <span>Download Signed PDF Report</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Full-width Comparator: Original, U-Net Contours, and Grad-CAM */}
      {scanResult && (
        <div className="glass-panel p-5 space-y-4 animate-fade-in">
          <div>
            <h4 className="font-extrabold text-slate-800 dark:text-white">Explainable AI (XAI) clinical comparator</h4>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              Cross-verify original lesion structures with high-fidelity U-Net segmentations and gradient CNN heatmaps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Original */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Original Scan</span>
              <div className="aspect-square rounded-xl bg-slate-950 border border-slate-200 dark:border-[#1f293d] overflow-hidden">
                <img
                  src={`/uploads/${scanResult.filename}`}
                  alt="Original lesion"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* U-Net Segmentation */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">U-Net Segment Contours</span>
              <div className="aspect-square rounded-xl bg-slate-950 border border-slate-200 dark:border-[#1f293d] overflow-hidden">
                <img
                  src={`/uploads/seg_${scanResult.filename}`}
                  alt="U-Net contours"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = `/uploads/${scanResult.filename}` }}
                />
              </div>
            </div>

            {/* Grad-CAM */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Grad-CAM Activation Map</span>
              <div className="aspect-square rounded-xl bg-slate-950 border border-slate-200 dark:border-[#1f293d] overflow-hidden">
                <img
                  src={`/uploads/${scanResult.heatmap_filename}`}
                  alt="Grad-CAM activation"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
