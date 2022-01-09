import React, { useMemo, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const activeStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

const thumbsContainer = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 16,
};

const thumb = {
  display: "inline-flex",
  borderRadius: 2,
  border: "1px solid #eaeaea",
  marginBottom: 8,
  marginRight: 8,
  width: "auto",
  height: 200,
  padding: 4,
  boxSizing: "border-box",
};

const thumbInner = {
  display: "flex",
  minWidth: 0,
  overflow: "hidden",
};

const img = {
  display: "block",
  width: "auto",
  height: "100%",
};

function StyledDropzone(props) {
  const [files, setFiles] = useState([]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    acceptedFiles,
    open,
  } = useDropzone({
    accept: "image/*",
    noClick: true,
    noKeyboard: true,
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject]
  );

  const thumbs = files.map((file) => (
    <div style={thumb} key={file.name}>
      <div style={thumbInner}>
        <img src={file.preview} style={img} />
      </div>
    </div>
  ));

  useEffect(
    () => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    },
    [files]
  );

  const filepath = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  const send = () => {
    console.log(files[0]);
    var bodyFormData = new FormData();
    setLoading(true);
    setResult(null);
    bodyFormData.append("file", files[0]);
    axios({
      method: "post",
      url: "https://somesh-ocr.herokuapp.com/upload",
      data: bodyFormData,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then(function (response) {
        console.log(response.data.string);
        setResult(response.data.string);
        setLoading(false);
      })
      .catch(function (error) {
        console.log(error);
        setLoading(false);
        setResult(null);
      });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
  };

  return (
    <div className="container">
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here</p>
        <ul>{filepath}</ul>
        <button type="button" onClick={open}>
          Open File Dialog
        </button>
      </div>
      <div>
        {result != null ? (
          <textarea rows="10" className="btn" value={result} />
        ) : null}
        <div className="resultBox">
          <button className="btn" onClick={send}>
            Read image
          </button>
          {result != null ? (
            <button className="btn" onClick={copyToClipboard}>
              copy
            </button>
          ) : null}
        </div>
      </div>

      {/* <aside>
        <h4>Files</h4>
      </aside> */}
    </div>
  );
}

ReactDOM.render(<StyledDropzone />, document.getElementById("root"));
