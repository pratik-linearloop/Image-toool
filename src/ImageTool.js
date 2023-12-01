import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import "./styles.css";
import Select from "react-select";
import { useLocation } from "react-router-dom";

function generateDownload(canvas, crop) {
  if (!crop || !canvas) {
    return;
  }

  canvas.toBlob(
    (blob) => {
      const previewUrl = window.URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.download = "cropPreview.png";
      anchor.href = URL.createObjectURL(blob);
      anchor.click();

      window.URL.revokeObjectURL(previewUrl);
    },
    "image/png",
    1
  );
}

export default function ImageTool(props) {
  console.log("props", props);
  const location = useLocation();
  const aspectParam = new URLSearchParams(location.search).get("aspect");

  const selectOptions = [
    {
      label: "Free",
      value: { unit: "%", width: 0 },
    },
    {
      label: "1:1",
      value: { unit: "%", width: 0, aspect: 1 / 1 },
    },
    // {
    //   label: "3:2",
    //   value: { unit: "%", width: 0, aspect: 3 / 2 },
    // },
    // {
    //   label: "4:5",
    //   value: { unit: "%", width: 0, aspect: 4 / 5 },
    // },
    // {
    //   label: "4:6",
    //   value: { unit: "%", width: 0, aspect: 4 / 6 },
    // },
    {
      label: "5:3",
      value: { unit: "%", width: 0, aspect: 5 / 3 },
    },
    {
      label: "9:16",
      value: { unit: "%", width: 0, aspect: 9 / 16 },
    },
  ];
  const [upImg, setUpImg] = useState();
  const [defaultOption, setDefaultOption] = useState();
  const [showSelect, setShowSelect] = useState(false);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [crop, setCrop] = useState({ unit: "%", width: 0, aspect: 9 / 16 });
  const [completedCrop, setCompletedCrop] = useState(null);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setUpImg(reader.result));
      reader.readAsDataURL(e.target.files[0]);
      setShowSelect(true);
    }
  };

  const onLoad = useCallback((img) => {
    imgRef.current = img;
  }, []);

  useEffect(() => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext("2d");
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );
  }, [completedCrop]);

  useEffect(() => {
    if (aspectParam === "5:3") {
      setCrop({ unit: "%", width: 0, aspect: 5 / 3 });
      setDefaultOption({
        label: "5:3",
        value: { unit: "%", width: 0, aspect: 5 / 3 },
      });
    }
    if (aspectParam === "1:1") {
      setCrop({ unit: "%", width: 0, aspect: 1 / 1 });
      setDefaultOption({
        label: "1:1",
        value: { unit: "%", width: 0, aspect: 1 / 1 },
      });
    }
    // if (aspectParam === "3:2") {
    //   setCrop({ unit: "%", width: 0, aspect: 3 / 2 });
    //   setDefaultOption({
    //     label: "3:2",
    //     value: { unit: "%", width: 0, aspect: 3 / 2 },
    //   });
    // }
    // if (aspectParam === "4:5") {
    //   setCrop({ unit: "%", width: 0, aspect: 4 / 5 });
    //   setDefaultOption({
    //     label: "4:5",
    //     value: { unit: "%", width: 0, aspect: 4 / 5 },
    //   });
    // }
    // if (aspectParam === "4:6") {
    //   setCrop({ unit: "%", width: 0, aspect: 4 / 6 });
    //   setDefaultOption({
    //     label: "4:6",
    //     value: { unit: "%", width: 0, aspect: 4 / 6 },
    //   });
    // }
    if (aspectParam === "9:16") {
      setCrop({ unit: "%", width: 0, aspect: 9 / 16 });
      setDefaultOption({
        label: "9:16",
        value: { unit: "%", width: 0, aspect: 9 / 16 },
      });
    } else {
      setCrop({ unit: "%", width: 0 });
      setDefaultOption({
        label: "Free",
        value: { unit: "%", width: 0 },
      });
    }
  }, [aspectParam]);

  return (
    <div className="App">
      <div className="functions">
        <div>
          <label for="file-upload" class="custom-file-upload">
            <span>Upload</span>
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={onSelectFile}
          />
        </div>
        {showSelect && (
          <Select
            className="selectField"
            options={selectOptions}
            defaultValue={defaultOption}
            onChange={(option) => setCrop(option?.value)}
          />
        )}
        <button
          type="button"
          className="downloadButton"
          hidden={!completedCrop?.width || !completedCrop?.height}
          disabled={!completedCrop?.width || !completedCrop?.height}
          onClick={() =>
            generateDownload(previewCanvasRef.current, completedCrop)
          }
        >
          Download
        </button>
      </div>

      <ReactCrop
        src={upImg}
        onImageLoaded={onLoad}
        crop={crop}
        onChange={(c) => setCrop(c)}
        onComplete={(c) => setCompletedCrop(c)}
      />
      <div className="canvas">
        <canvas
          ref={previewCanvasRef}
          style={{
            width: Math.round(completedCrop?.width ?? 0),
            height: Math.round(completedCrop?.height ?? 0),
          }}
        />
      </div>
    </div>
  );
}
