import axios from "axios";

export async function uploadImage(file, image) {
  if (!file) throw new Error("No file selected");

  const formData = new FormData();
  formData.append("image", file, file.name);

  const res = await axios.post(
    "https://camp-coding.tech/eg_Institute/image_uplouder.php",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
    // سيب الهيدرز.. axios هيظبطها
  );

  return res.data; // غالبًا بيرجع url أو object
}
