import { useRef, useMemo, useCallback, useState, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Controller } from "react-hook-form";
import { Box, Typography, FormHelperText, Popover } from "@mui/material";
import EmojeyUrl from "../../../assets/icons/Emojey.svg";

// const EMOJI_LIST = [
//   "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃",
//   "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙",
//   "🥲", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫",
//   "🤔", "🫡", "😐", "😑", "😶", "🫥", "😏", "😒", "🙄", "😬",
//   "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢",
//   "🤮", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "🥸", "😎",
//   "🤓", "🧐", "😕", "🫤", "😟", "🙁", "😮", "😯", "😲", "😳",
//   "🥺", "🥹", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱",
//   "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠",
//   "🤬", "👍", "👎", "👏", "🙌", "🤝", "❤️", "🔥", "⭐", "✨",
//   "🎉", "🎊", "💯", "✅", "❌", "⚡", "💪", "🙏", "👀", "💬",
//   "📌", "🚀",
// ];

const RichTextEditor = ({
  name,
  control,
  label,
  placeholder = "Description",
  rules,
  helperText,
  disabled = false,
  minHeight = 150,
  onImageUpload,
}) => {
  const quillRef = useRef(null);
  const [emojiAnchor, setEmojiAnchor] = useState(null);
  const handlersRef = useRef({});

  const getEditor = useCallback(() => {
    try {
      return quillRef.current?.getEditor() || null;
    } catch {
      return null;
    }
  }, []);

  const handleEmoji = useCallback(() => {
    const editor = getEditor();
    const toolbar = editor?.container?.parentElement?.querySelector(".ql-toolbar");
    const emojiBtn = toolbar?.querySelector(".ql-emoji");
    if (emojiBtn) {
      setEmojiAnchor((prev) => (prev ? null : emojiBtn));
    }
  }, [getEditor]);

  const insertEmoji = useCallback(
    (emoji) => {
      const editor = getEditor();
      if (!editor) return;
      const range = editor.getSelection(true);
      editor.insertText(range.index, emoji);
      editor.setSelection(range.index + emoji.length);
      setEmojiAnchor(null);
    },
    [getEditor]
  );

  const handleImage = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const editor = getEditor();
      if (!editor) return;
      const range = editor.getSelection(true);

      if (onImageUpload) {
        try {
          const url = await onImageUpload(file);
          editor.insertEmbed(range.index, "image", url);
          editor.setSelection(range.index + 1);
        } catch {
          console.error("Image upload failed");
        }
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          editor.insertEmbed(range.index, "image", reader.result);
          editor.setSelection(range.index + 1);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [getEditor, onImageUpload]);

  handlersRef.current.emoji = handleEmoji;
  handlersRef.current.image = handleImage;

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ align: [] }],
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
        ],
        //    container: [
        //   [{ align: [] }],
        //   ["bold", "italic", "underline"],
        //   [{ list: "ordered" }, { list: "bullet" }],
        //   ["link", "emoji", "image"],
        // ],
        handlers: {
          emoji: (...args) => handlersRef.current.emoji(...args),
          image: (...args) => handlersRef.current.image(...args),
        },
      },
    }),
    []
  );

  const formats = useMemo(
    () => ["align", "bold", "italic", "underline", "list", "bullet", "ordered", "link", "image"],
    []
  );

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;

    const tryInjectEmoji = () => {
      const editor = getEditor();
      const toolbar = editor?.container?.parentElement?.querySelector(".ql-toolbar");
      const emojiBtn = toolbar?.querySelector(".ql-emoji");

      if (emojiBtn) {
        emojiBtn.innerHTML = "";
        const img = document.createElement("img");
        img.src = EmojeyUrl;
        img.width = 16;
        img.height = 16;
        img.style.display = "block";
        emojiBtn.appendChild(img);
        return;
      }

      if (attempts < maxAttempts) {
        attempts++;
        setTimeout(tryInjectEmoji, 50);
      }
    };

    tryInjectEmoji();
  }, [getEditor]);

  useEffect(() => {
    const editor = getEditor();
    if (!editor) return;

    const root = editor.root;

    const handleClick = (e) => {
      if (e.target.tagName === "IMG") {
        const blot = editor.constructor.find(e.target);
        if (blot) {
          const index = editor.getIndex(blot);
          editor.setSelection(index, 1);
        }
      }
    };

    root.addEventListener("click", handleClick);
    return () => root.removeEventListener("click", handleClick);
  }, [getEditor]);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <Box sx={{ width: "100%" }}>
          {label && (
            <Typography
              sx={{
                mb: 1,
                fontSize: "16px",
                fontWeight: 400,
                color: error ? "error.main" : "#151515",
              }}
            >
              {label}
            </Typography>
          )}

          <Box
            sx={{
              "& .ql-toolbar.ql-snow": {
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
                borderColor: error ? "error.main" : "#E0E0E0",
                backgroundColor: "#FAFAFA",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                "& .ql-formats": {
                  marginRight: "8px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "2px",
                  "&::after": { content: "none" },
                },
                "& button": {
                  width: "32px",
                  height: "32px",
                  padding: "4px",
                  borderRadius: "4px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                  "&.ql-active": {
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                    color: "#1976d2",
                    "& .ql-stroke": { stroke: "#1976d2" },
                    "& .ql-fill": { fill: "#1976d2" },
                  },
                },
                "& .ql-picker": {
                  height: "32px",
                  display: "inline-flex",
                  alignItems: "center",
                },
                "& .ql-emoji": {
                  position: "relative",
                  backgroundImage: `url("${EmojeyUrl}")`,
                  backgroundSize: "16px 16px",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                },
                "& .ql-emoji svg": { display: "none" },
              },
              "& .ql-container.ql-snow": {
                borderBottomLeftRadius: "8px",
                borderBottomRightRadius: "8px",
                borderColor: error ? "error.main" : "#E0E0E0",
                fontSize: "14px",
                fontFamily: "inherit",
                minHeight: `${minHeight}px`,
              },
              "& .ql-editor": {
                minHeight: `${minHeight}px`,
                padding: "12px 16px",
                fontSize: "14px",
                lineHeight: 1.6,
                fontFamily: "inherit",
                "&.ql-blank::before": {
                  color: "#BDBDBD",
                  fontStyle: "normal",
                  fontSize: "14px",
                  left: "16px",
                  right: "16px",
                },
                "& img": {
                  maxWidth: "100%",
                  height: "auto",
                  cursor: "pointer",
                  borderRadius: "4px",
                  transition: "outline 0.15s",
                  "&:hover": {
                    outline: "2px solid #1976d2",
                    outlineOffset: "2px",
                  },
                },
              },
              "& .ql-snow .ql-stroke": { strokeWidth: 1.5 },
              ...(disabled && { opacity: 0.6, pointerEvents: "none" }),
            }}
          >
            <ReactQuill
              ref={quillRef}
              theme="snow"
              modules={modules}
              formats={formats}
              placeholder={placeholder}
              value={field.value || ""}
              onChange={(content) => {
                const isEmpty = content === "<p><br></p>" || content.trim() === "";
                field.onChange(isEmpty ? "" : content);
              }}
              onBlur={field.onBlur}
              readOnly={disabled}
            />
          </Box>

          <Popover
            open={Boolean(emojiAnchor)}
            anchorEl={emojiAnchor}
            onClose={() => setEmojiAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            slotProps={{
              paper: {
                sx: {
                  mt: 0.5,
                  p: 1.5,
                  width: 320,
                  maxHeight: 280,
                  overflowY: "auto",
                  display: "grid",
                  gridTemplateColumns: "repeat(8, 1fr)",
                  gap: "2px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                },
              },
            }}
          >
            {/* {EMOJI_LIST.map((emoji) => (
              <Box
                key={emoji}
                onClick={() => insertEmoji(emoji)}
                sx={{
                  width: 34,
                  height: 34,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "all 0.15s",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.06)",
                    transform: "scale(1.15)",
                  },
                }}
              >
                {emoji}
              </Box>
            ))} */}
          </Popover>

          {(error || helperText) && (
            <FormHelperText error={!!error} sx={{ mt: 0.5, mx: "14px" }}>
              {error?.message || helperText}
            </FormHelperText>
          )}
        </Box>
      )}
    />
  );
};

export default RichTextEditor;