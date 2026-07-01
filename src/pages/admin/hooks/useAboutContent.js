import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const getAuthToken = () => {
  const rawToken = localStorage.getItem("accessToken");
  return rawToken ? JSON.parse(rawToken) : null;
};

// ─── Shared upload helpers ────────────────────────────────────────────────────
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to upload image");
  const result = await res.json();
  return result.data.url;
};

const uploadVideo = async (file) => {
  const formData = new FormData();
  formData.append("video", file);
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/upload/video`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    credentials: "include",
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result?.error || "Failed to upload video");
  return result.data.url;
};

const putAboutContent = async (payload) => {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/about-content`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result?.error || "Failed to save content");
  return result;
};

// ─── Default values ───────────────────────────────────────────────────────────
const DEFAULTS = {
  facilityHeading: "Pakistan's Largest Nutraceutical Manufacturing Facility",
  facilityDescription:
    "With over a decade of experience, Naashpati specializes in manufacturing nutraceutical and natural healthcare products. Backed by modern laboratories, strict quality protocols, and scalable production systems, we continue to set standards in safety, consistency, and product innovation.",
  facilityImages: [
    "/images/banners/hero_banner1.jpg",
    "/images/banners/hero_banner1.jpg",
    "/images/banners/hero_banner1.jpg",
  ],
  scienceHeading: "We Are Backed By Science",
  scienceDescription:
    "Naashpati delivers high-quality, safe products crafted under expert supervision and aligned with global standards. Committed to GMP, HACCP, ISO systems, and compliance-driven quality controls, we ensure excellence at every stage.",
  scienceBadgeImages: [],
  scienceImage: "",
  whyNutrifactorHeading: "WHY NUTRIFACTOR!",
  whyNutrifactorDescription:
    "Nutrifactor stands out from other nutraceutical brands due to our values of transparency and traceability in delivering high-quality natural healthcare products. Our commitment to excellence encompasses sustainable sourcing, integrity across all levels, and rigorous testing methods exceeding usual standard practices. We strive to bridge the gap between consumers and nutraceuticals science by being transparent in our labels. All the health benefits listed on our products are strictly in accordance with the scientific research.",
  whyNutrifactorImage: "",
  missionHeading: "Bridging Ancient Wisdom with Modern Wellness",
  missionDescription:
    "For centuries, herbal traditions have guided communities toward balance and vitality. At Naashpati, we honour that heritage by making it accessible, transparent, and trustworthy for the modern world. From the highland farms of Morocco to the tropical forests of Sri Lanka, we trace every ingredient back to its origin and share that journey with you because you deserve to know exactly what you're putting in your body.",
  missionImage: "",
  healthPriorityHeading: "YOUR HEALTH, OUR PRIORITY",
  healthPriorityItems: [
    {
      title: "SUPERIOR MANUFACTURING",
      description:
        "Nutrifactor establishes high-quality manufacturing standards for nutraceutical products, maintaining control over the entire production process with stringent adherence to cGMPs. Our commitment extends to thorough documentation to ensure the traceability of every step.",
    },
    {
      title: "RESEARCH & DEVELOPMENT",
      description:
        "Our research pilot plant stays up-to-date with the latest findings about the natural ingredients and nutraceuticals, which are further supported by our laboratory studies. We rely on scientific research to ensure the authenticity and accuracy of our health-related claims.",
    },
    {
      title: "CURRENT HEALTH CONCERNS",
      description:
        "We focus on the health issues of our consumers by placing their needs at the core of our formulations. Upon identifying current health concerns, we promptly conduct research to develop top-quality natural healthcare products that meet the identified health needs.",
    },
  ],
  healthPriorityImages: ["", "", "", ""],
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useAboutContent = () => {
  // Video
  const [aboutVideoFile, setAboutVideoFile] = useState(null);
  const [aboutVideoPreview, setAboutVideoPreview] = useState("");
  const [aboutVideoUrl, setAboutVideoUrl] = useState("");
  const [uploadingAboutVideo, setUploadingAboutVideo] = useState(false);
  const [loadingAboutVideo, setLoadingAboutVideo] = useState(false);

  // Facility / after-video section
  const [aboutSectionHeading, setAboutSectionHeading] = useState("");
  const [aboutSectionDescription, setAboutSectionDescription] = useState("");
  const [aboutSectionImages, setAboutSectionImages] = useState(["", "", ""]);
  const [aboutSectionImageFiles, setAboutSectionImageFiles] = useState([
    null,
    null,
    null,
  ]);
  const [aboutSectionImagePreviews, setAboutSectionImagePreviews] = useState([
    "",
    "",
    "",
  ]);
  const [savingAboutSection, setSavingAboutSection] = useState(false);

  // Science section
  const [scienceHeading, setScienceHeading] = useState("");
  const [scienceDescription, setScienceDescription] = useState("");
  const [scienceBadgeImages, setScienceBadgeImages] = useState([]);
  const [scienceBadgeImageFiles, setScienceBadgeImageFiles] = useState([]);
  const [scienceBadgeImagePreviews, setScienceBadgeImagePreviews] = useState(
    [],
  );
  const [scienceImage, setScienceImage] = useState("");
  const [scienceImageFile, setScienceImageFile] = useState(null);
  const [scienceImagePreview, setScienceImagePreview] = useState("");
  const [savingScienceSection, setSavingScienceSection] = useState(false);

  // Why Nutrifactor section
  const [whyNutrifactorHeading, setWhyNutrifactorHeading] = useState("");
  const [whyNutrifactorDescription, setWhyNutrifactorDescription] =
    useState("");
  const [whyNutrifactorImage, setWhyNutrifactorImage] = useState("");
  const [whyNutrifactorImageFile, setWhyNutrifactorImageFile] = useState(null);
  const [whyNutrifactorImagePreview, setWhyNutrifactorImagePreview] =
    useState("");
  const [savingWhyNutrifactorSection, setSavingWhyNutrifactorSection] =
    useState(false);

  // Mission section
  const [missionHeading, setMissionHeading] = useState("");
  const [missionDescription, setMissionDescription] = useState("");
  const [missionImage, setMissionImage] = useState("");
  const [missionImageFile, setMissionImageFile] = useState(null);
  const [missionImagePreview, setMissionImagePreview] = useState("");
  const [savingMissionSection, setSavingMissionSection] = useState(false);

  // Health priority section
  const [healthPriorityHeading, setHealthPriorityHeading] = useState("");
  const [healthPriorityItems, setHealthPriorityItems] = useState([
    { title: "", description: "" },
    { title: "", description: "" },
    { title: "", description: "" },
  ]);
  const [healthPriorityImages, setHealthPriorityImages] = useState([
    "",
    "",
    "",
    "",
  ]);
  const [healthPriorityImageFiles, setHealthPriorityImageFiles] = useState([
    null,
    null,
    null,
    null,
  ]);
  const [healthPriorityImagePreviews, setHealthPriorityImagePreviews] =
    useState(["", "", "", ""]);
  const [savingHealthPrioritySection, setSavingHealthPrioritySection] =
    useState(false);

  // Team members
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamMemberImageFiles, setTeamMemberImageFiles] = useState([]);
  const [teamMemberImagePreviews, setTeamMemberImagePreviews] = useState([]);
  const [savingTeamMembers, setSavingTeamMembers] = useState(false);

  // ── Cleanup blob URL on unmount ─────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (aboutVideoPreview) URL.revokeObjectURL(aboutVideoPreview);
    };
  }, [aboutVideoPreview]);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchAboutContent = useCallback(async () => {
    try {
      setLoadingAboutVideo(true);
      const response = await fetch(`${API_URL}/about-content`);
      if (!response.ok) throw new Error("Failed to fetch About content");
      const result = await response.json();
      const d = result?.data ?? {};

      setAboutVideoUrl(d.videoUrl || "");

      setAboutSectionHeading(
        d.facilityHeading?.trim() || DEFAULTS.facilityHeading,
      );
      setAboutSectionDescription(
        d.facilityDescription?.trim() || DEFAULTS.facilityDescription,
      );
      const remoteImages = Array.isArray(d.facilityImages)
        ? d.facilityImages
        : [];
      setAboutSectionImages(
        [0, 1, 2].map((i) => remoteImages[i] || DEFAULTS.facilityImages[i]),
      );
      setAboutSectionImageFiles([null, null, null]);
      setAboutSectionImagePreviews(["", "", ""]);

      setScienceHeading(d.scienceHeading?.trim() || DEFAULTS.scienceHeading);
      setScienceDescription(
        d.scienceDescription?.trim() || DEFAULTS.scienceDescription,
      );
      setScienceBadgeImages(
        Array.isArray(d.scienceBadgeImages) ? d.scienceBadgeImages : [],
      );
      setScienceBadgeImageFiles([]);
      setScienceBadgeImagePreviews([]);
      setScienceImage(d.scienceImage || "");
      setScienceImageFile(null);
      setScienceImagePreview("");

      setWhyNutrifactorHeading(
        d.whyNutrifactorHeading?.trim() || DEFAULTS.whyNutrifactorHeading,
      );
      setWhyNutrifactorDescription(
        d.whyNutrifactorDescription?.trim() ||
          DEFAULTS.whyNutrifactorDescription,
      );
      setWhyNutrifactorImage(d.whyNutrifactorImage || "");
      setWhyNutrifactorImageFile(null);
      setWhyNutrifactorImagePreview("");

      setMissionHeading(d.missionHeading?.trim() || DEFAULTS.missionHeading);
      setMissionDescription(
        d.missionDescription?.trim() || DEFAULTS.missionDescription,
      );
      setMissionImage(d.missionImage || "");
      setMissionImageFile(null);
      setMissionImagePreview("");

      setHealthPriorityHeading(
        d.healthPriorityHeading?.trim() || DEFAULTS.healthPriorityHeading,
      );
      const remoteItems = Array.isArray(d.healthPriorityItems)
        ? d.healthPriorityItems
        : [];
      setHealthPriorityItems(
        [0, 1, 2].map((i) => remoteItems[i] || DEFAULTS.healthPriorityItems[i]),
      );
      const remoteHpImages = Array.isArray(d.healthPriorityImages)
        ? d.healthPriorityImages
        : [];
      setHealthPriorityImages([0, 1, 2, 3].map((i) => remoteHpImages[i] || ""));
      setHealthPriorityImageFiles([null, null, null, null]);
      setHealthPriorityImagePreviews(["", "", "", ""]);

      const remoteTeam = Array.isArray(d.teamMembers) ? d.teamMembers : [];
      setTeamMembers(remoteTeam);
      setTeamMemberImageFiles(new Array(remoteTeam.length).fill(null));
      setTeamMemberImagePreviews(new Array(remoteTeam.length).fill(""));
    } catch {
      setAboutVideoUrl("");
      setAboutSectionHeading(DEFAULTS.facilityHeading);
      setAboutSectionDescription(DEFAULTS.facilityDescription);
      setAboutSectionImages(DEFAULTS.facilityImages);
      setAboutSectionImageFiles([null, null, null]);
      setAboutSectionImagePreviews(["", "", ""]);
      setScienceHeading(DEFAULTS.scienceHeading);
      setScienceDescription(DEFAULTS.scienceDescription);
      setScienceBadgeImages(DEFAULTS.scienceBadgeImages);
      setScienceBadgeImageFiles([]);
      setScienceBadgeImagePreviews([]);
      setScienceImage(DEFAULTS.scienceImage);
      setScienceImageFile(null);
      setScienceImagePreview("");
      setWhyNutrifactorHeading(DEFAULTS.whyNutrifactorHeading);
      setWhyNutrifactorDescription(DEFAULTS.whyNutrifactorDescription);
      setWhyNutrifactorImage(DEFAULTS.whyNutrifactorImage);
      setWhyNutrifactorImageFile(null);
      setWhyNutrifactorImagePreview("");
      setMissionHeading(DEFAULTS.missionHeading);
      setMissionDescription(DEFAULTS.missionDescription);
      setMissionImage(DEFAULTS.missionImage);
      setMissionImageFile(null);
      setMissionImagePreview("");
      setHealthPriorityHeading(DEFAULTS.healthPriorityHeading);
      setHealthPriorityItems(DEFAULTS.healthPriorityItems);
      setHealthPriorityImages(DEFAULTS.healthPriorityImages);
      setHealthPriorityImageFiles([null, null, null, null]);
      setHealthPriorityImagePreviews(["", "", "", ""]);
      setTeamMembers([]);
      setTeamMemberImageFiles([]);
      setTeamMemberImagePreviews([]);
    } finally {
      setLoadingAboutVideo(false);
    }
  }, []);

  // ── Video handlers ───────────────────────────────────────────────────────────
  const handleUploadAboutVideo = async (e) => {
    e.preventDefault();
    if (!aboutVideoFile) {
      toast.error("Please select a video file first");
      return;
    }
    try {
      setUploadingAboutVideo(true);
      const videoUrl = await uploadVideo(aboutVideoFile);
      const result = await putAboutContent({ videoUrl });
      setAboutVideoUrl(result?.data?.videoUrl || videoUrl);
      setAboutVideoFile(null);
      if (aboutVideoPreview) URL.revokeObjectURL(aboutVideoPreview);
      setAboutVideoPreview("");
      toast.success("About video updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update About video");
    } finally {
      setUploadingAboutVideo(false);
    }
  };

  const handleRemoveAboutVideo = async () => {
    if (!window.confirm("Remove current About page video?")) return;
    try {
      setUploadingAboutVideo(true);
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/about-content`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const result = await res.json();
      if (!res.ok)
        throw new Error(result?.error || "Failed to remove About video");
      setAboutVideoUrl("");
      setAboutVideoFile(null);
      if (aboutVideoPreview) URL.revokeObjectURL(aboutVideoPreview);
      setAboutVideoPreview("");
      toast.success("About video removed");
    } catch (error) {
      toast.error(error.message || "Failed to remove About video");
    } finally {
      setUploadingAboutVideo(false);
    }
  };

  // ── Facility / about-section handlers ───────────────────────────────────────
  const handleAboutSectionImageChange = (index, file) => {
    if (!file) return;
    const nextFiles = [...aboutSectionImageFiles];
    nextFiles[index] = file;
    setAboutSectionImageFiles(nextFiles);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const next = [...aboutSectionImagePreviews];
      next[index] = ev.target?.result || "";
      setAboutSectionImagePreviews(next);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAboutSectionImage = (index) => {
    const ni = [...aboutSectionImages];
    ni[index] = "";
    setAboutSectionImages(ni);
    const nf = [...aboutSectionImageFiles];
    nf[index] = null;
    setAboutSectionImageFiles(nf);
    const np = [...aboutSectionImagePreviews];
    np[index] = "";
    setAboutSectionImagePreviews(np);
  };

  const handleResetAboutSectionDefaults = () => {
    setAboutSectionHeading(DEFAULTS.facilityHeading);
    setAboutSectionDescription(DEFAULTS.facilityDescription);
    setAboutSectionImages(DEFAULTS.facilityImages);
    setAboutSectionImageFiles([null, null, null]);
    setAboutSectionImagePreviews(["", "", ""]);
  };

  const handleSaveAboutSection = async (e) => {
    e.preventDefault();
    if (!aboutSectionHeading.trim()) {
      toast.error("Section heading is required");
      return;
    }
    if (!aboutSectionDescription.trim()) {
      toast.error("Section description is required");
      return;
    }
    try {
      setSavingAboutSection(true);
      const uploadedImages = [...aboutSectionImages];
      for (let i = 0; i < 3; i++) {
        if (aboutSectionImageFiles[i])
          uploadedImages[i] = await uploadImage(aboutSectionImageFiles[i]);
      }
      if (uploadedImages.some((x) => !x))
        throw new Error("Please provide all 3 images");
      await putAboutContent({
        facilityHeading: aboutSectionHeading.trim(),
        facilityDescription: aboutSectionDescription.trim(),
        facilityImages: uploadedImages,
      });
      setAboutSectionImages(uploadedImages);
      setAboutSectionImageFiles([null, null, null]);
      setAboutSectionImagePreviews(["", "", ""]);
      toast.success("Section after video updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to save section");
    } finally {
      setSavingAboutSection(false);
    }
  };

  // ── Science section handlers ─────────────────────────────────────────────────
  const handleScienceImageChange = (file) => {
    if (!file) return;
    setScienceImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setScienceImagePreview(ev.target?.result || "");
    reader.readAsDataURL(file);
  };

  const handleRemoveScienceImage = () => {
    setScienceImage("");
    setScienceImageFile(null);
    setScienceImagePreview("");
  };

  const handleScienceBadgeImageSelection = (files) => {
    if (!files?.length) return;
    const allowedCount = Math.max(0, 8 - scienceBadgeImages.length);
    const selected = Array.from(files).slice(0, allowedCount);
    if (selected.length < files.length)
      toast.error("Maximum 8 certification badges are allowed");
    if (!selected.length) return;
    setScienceBadgeImageFiles((prev) => [...prev, ...selected]);
    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setScienceBadgeImagePreviews((prev) => [
          ...prev,
          ev.target?.result || "",
        ]);
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveSavedScienceBadge = (index) => {
    const next = [...scienceBadgeImages];
    next.splice(index, 1);
    setScienceBadgeImages(next);
  };

  const handleRemovePendingScienceBadge = (index) => {
    setScienceBadgeImageFiles((prev) => prev.filter((_, i) => i !== index));
    setScienceBadgeImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResetScienceSectionDefaults = () => {
    setScienceHeading(DEFAULTS.scienceHeading);
    setScienceDescription(DEFAULTS.scienceDescription);
    setScienceBadgeImages(DEFAULTS.scienceBadgeImages);
    setScienceBadgeImageFiles([]);
    setScienceBadgeImagePreviews([]);
    setScienceImage(DEFAULTS.scienceImage);
    setScienceImageFile(null);
    setScienceImagePreview("");
  };

  const handleSaveScienceSection = async (e) => {
    e.preventDefault();
    if (!scienceHeading.trim()) {
      toast.error("Science section heading is required");
      return;
    }
    if (!scienceDescription.trim()) {
      toast.error("Science section description is required");
      return;
    }
    try {
      setSavingScienceSection(true);
      let uploadedBadges = [...scienceBadgeImages];
      if (scienceBadgeImageFiles.length > 0) {
        const newUploads = await Promise.all(
          scienceBadgeImageFiles.map(uploadImage),
        );
        uploadedBadges = [...uploadedBadges, ...newUploads].slice(0, 8);
      }
      if (uploadedBadges.length < 1) {
        toast.error("Please upload at least one certification badge image");
        return;
      }
      let uploadedScienceImage = scienceImage;
      if (scienceImageFile)
        uploadedScienceImage = await uploadImage(scienceImageFile);
      if (!uploadedScienceImage) {
        toast.error("Please upload one image for this section");
        return;
      }
      await putAboutContent({
        scienceHeading: scienceHeading.trim(),
        scienceDescription: scienceDescription.trim(),
        scienceBadgeImages: uploadedBadges,
        scienceImage: uploadedScienceImage,
      });
      setScienceBadgeImages(uploadedBadges);
      setScienceBadgeImageFiles([]);
      setScienceBadgeImagePreviews([]);
      setScienceImage(uploadedScienceImage);
      setScienceImageFile(null);
      setScienceImagePreview("");
      toast.success("Science section updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to save science section");
    } finally {
      setSavingScienceSection(false);
    }
  };

  // ── Why Nutrifactor handlers ─────────────────────────────────────────────────
  const handleWhyNutrifactorImageChange = (file) => {
    if (!file) return;
    setWhyNutrifactorImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) =>
      setWhyNutrifactorImagePreview(ev.target?.result || "");
    reader.readAsDataURL(file);
  };

  const handleRemoveWhyNutrifactorImage = () => {
    setWhyNutrifactorImage("");
    setWhyNutrifactorImageFile(null);
    setWhyNutrifactorImagePreview("");
  };

  const handleResetWhyNutrifactorSectionDefaults = () => {
    setWhyNutrifactorHeading(DEFAULTS.whyNutrifactorHeading);
    setWhyNutrifactorDescription(DEFAULTS.whyNutrifactorDescription);
    setWhyNutrifactorImage(DEFAULTS.whyNutrifactorImage);
    setWhyNutrifactorImageFile(null);
    setWhyNutrifactorImagePreview("");
  };

  const handleSaveWhyNutrifactorSection = async (e) => {
    e.preventDefault();
    if (!whyNutrifactorHeading.trim()) {
      toast.error("Why Nutrifactor heading is required");
      return;
    }
    if (!whyNutrifactorDescription.trim()) {
      toast.error("Why Nutrifactor description is required");
      return;
    }
    try {
      setSavingWhyNutrifactorSection(true);
      let uploadedImg = whyNutrifactorImage;
      if (whyNutrifactorImageFile)
        uploadedImg = await uploadImage(whyNutrifactorImageFile);
      if (!uploadedImg) {
        toast.error("Please upload one image for this section");
        return;
      }
      await putAboutContent({
        whyNutrifactorHeading: whyNutrifactorHeading.trim(),
        whyNutrifactorDescription: whyNutrifactorDescription.trim(),
        whyNutrifactorImage: uploadedImg,
      });
      setWhyNutrifactorImage(uploadedImg);
      setWhyNutrifactorImageFile(null);
      setWhyNutrifactorImagePreview("");
      toast.success("Why Nutrifactor section updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to save Why Nutrifactor section");
    } finally {
      setSavingWhyNutrifactorSection(false);
    }
  };

  // ── Mission handlers ─────────────────────────────────────────────────────────
  const handleMissionImageChange = (file) => {
    if (!file) return;
    setMissionImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setMissionImagePreview(ev.target?.result || "");
    reader.readAsDataURL(file);
  };

  const handleRemoveMissionImage = () => {
    setMissionImage("");
    setMissionImageFile(null);
    setMissionImagePreview("");
  };

  const handleResetMissionSectionDefaults = () => {
    setMissionHeading(DEFAULTS.missionHeading);
    setMissionDescription(DEFAULTS.missionDescription);
    setMissionImage(DEFAULTS.missionImage);
    setMissionImageFile(null);
    setMissionImagePreview("");
  };

  const handleSaveMissionSection = async (e) => {
    e.preventDefault();
    if (!missionHeading.trim()) {
      toast.error("Mission heading is required");
      return;
    }
    if (!missionDescription.trim()) {
      toast.error("Mission description is required");
      return;
    }
    try {
      setSavingMissionSection(true);
      let uploadedImg = missionImage;
      if (missionImageFile) uploadedImg = await uploadImage(missionImageFile);
      if (!uploadedImg) {
        toast.error("Please upload one image for this section");
        return;
      }
      await putAboutContent({
        missionHeading: missionHeading.trim(),
        missionDescription: missionDescription.trim(),
        missionImage: uploadedImg,
      });
      setMissionImage(uploadedImg);
      setMissionImageFile(null);
      setMissionImagePreview("");
      toast.success("Mission section updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to save Mission section");
    } finally {
      setSavingMissionSection(false);
    }
  };

  // ── Health Priority handlers ──────────────────────────────────────────────────
  const handleHealthPriorityItemChange = (index, field, value) => {
    setHealthPriorityItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleHealthPriorityImageChange = (index, file) => {
    if (!file) return;
    setHealthPriorityImageFiles((prev) => {
      const n = [...prev];
      n[index] = file;
      return n;
    });
    const reader = new FileReader();
    reader.onload = (ev) =>
      setHealthPriorityImagePreviews((prev) => {
        const n = [...prev];
        n[index] = ev.target?.result || "";
        return n;
      });
    reader.readAsDataURL(file);
  };

  const handleRemoveHealthPriorityImage = (index) => {
    setHealthPriorityImages((prev) => {
      const n = [...prev];
      n[index] = "";
      return n;
    });
    setHealthPriorityImageFiles((prev) => {
      const n = [...prev];
      n[index] = null;
      return n;
    });
    setHealthPriorityImagePreviews((prev) => {
      const n = [...prev];
      n[index] = "";
      return n;
    });
  };

  const handleResetHealthPrioritySectionDefaults = () => {
    setHealthPriorityHeading(DEFAULTS.healthPriorityHeading);
    setHealthPriorityItems(DEFAULTS.healthPriorityItems);
    setHealthPriorityImages(DEFAULTS.healthPriorityImages);
    setHealthPriorityImageFiles([null, null, null, null]);
    setHealthPriorityImagePreviews(["", "", "", ""]);
  };

  const handleSaveHealthPrioritySection = async (e) => {
    e.preventDefault();
    if (!healthPriorityHeading.trim()) {
      toast.error("Health priority heading is required");
      return;
    }
    const normalizedItems = healthPriorityItems.map((item) => ({
      title: item.title?.trim() || "",
      description: item.description?.trim() || "",
    }));
    if (normalizedItems.some((item) => !item.title || !item.description)) {
      toast.error("Please complete all three text blocks");
      return;
    }
    try {
      setSavingHealthPrioritySection(true);
      const uploaded = [...healthPriorityImages];
      for (let i = 0; i < 4; i++) {
        if (healthPriorityImageFiles[i])
          uploaded[i] = await uploadImage(healthPriorityImageFiles[i]);
      }
      const payloadImages = uploaded.filter(Boolean).slice(0, 4);
      await putAboutContent({
        healthPriorityHeading: healthPriorityHeading.trim(),
        healthPriorityItems: normalizedItems,
        healthPriorityImages: payloadImages,
      });
      setHealthPriorityImages([
        payloadImages[0] || "",
        payloadImages[1] || "",
        payloadImages[2] || "",
        payloadImages[3] || "",
      ]);
      setHealthPriorityImageFiles([null, null, null, null]);
      setHealthPriorityImagePreviews(["", "", "", ""]);
      toast.success("Health Priority section updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to save Health Priority section");
    } finally {
      setSavingHealthPrioritySection(false);
    }
  };

  // ── Team member handlers ──────────────────────────────────────────────────────
  const handleTeamMemberChange = (index, field, value) => {
    setTeamMembers((prev) => {
      const n = [...prev];
      n[index] = { ...n[index], [field]: value };
      return n;
    });
  };

  const handleTeamMemberImageChange = (index, file) => {
    if (!file) return;
    setTeamMemberImageFiles((prev) => {
      const n = [...prev];
      n[index] = file;
      return n;
    });
    const reader = new FileReader();
    reader.onload = (ev) =>
      setTeamMemberImagePreviews((prev) => {
        const n = [...prev];
        n[index] = ev.target?.result || "";
        return n;
      });
    reader.readAsDataURL(file);
  };

  const handleRemoveTeamMemberImage = (index) => {
    setTeamMembers((prev) => {
      const n = [...prev];
      n[index] = { ...n[index], image: "" };
      return n;
    });
    setTeamMemberImageFiles((prev) => {
      const n = [...prev];
      n[index] = null;
      return n;
    });
    setTeamMemberImagePreviews((prev) => {
      const n = [...prev];
      n[index] = "";
      return n;
    });
  };

  const handleAddTeamMember = () => {
    if (teamMembers.length >= 12) {
      toast.error("Maximum 12 team members are allowed");
      return;
    }
    setTeamMembers((prev) => [
      ...prev,
      { name: "", role: "", bio: "", image: "" },
    ]);
    setTeamMemberImageFiles((prev) => [...prev, null]);
    setTeamMemberImagePreviews((prev) => [...prev, ""]);
  };

  const handleRemoveTeamMember = (index) => {
    setTeamMembers((prev) => prev.filter((_, i) => i !== index));
    setTeamMemberImageFiles((prev) => prev.filter((_, i) => i !== index));
    setTeamMemberImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResetTeamMembersDefaults = () => {
    setTeamMembers([]);
    setTeamMemberImageFiles([]);
    setTeamMemberImagePreviews([]);
  };

  const handleSaveTeamMembers = async (e) => {
    e.preventDefault();
    try {
      setSavingTeamMembers(true);
      const uploaded = [...teamMembers];
      for (let i = 0; i < uploaded.length; i++) {
        if (teamMemberImageFiles[i]) {
          const url = await uploadImage(teamMemberImageFiles[i]);
          uploaded[i] = { ...uploaded[i], image: url };
        }
      }
      const normalized = uploaded
        .map((m) => ({
          name: m.name?.trim() || "",
          role: m.role?.trim() || "",
          bio: m.bio?.trim() || "",
          image: m.image?.trim() || "",
        }))
        .filter((m) => m.name || m.role || m.bio || m.image)
        .slice(0, 12);
      if (normalized.length < 1) {
        toast.error("Please add at least one team member");
        return;
      }
      if (normalized.some((m) => !m.name || !m.role || !m.bio)) {
        toast.error("Please complete name, role, and bio for each team member");
        return;
      }
      if (normalized.some((m) => !m.image)) {
        toast.error("Please upload one image for each team member");
        return;
      }
      await putAboutContent({ teamMembers: normalized });
      setTeamMembers(normalized);
      setTeamMemberImageFiles(new Array(normalized.length).fill(null));
      setTeamMemberImagePreviews(new Array(normalized.length).fill(""));
      toast.success("Team members updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to save team members");
    } finally {
      setSavingTeamMembers(false);
    }
  };

  return {
    // Video
    aboutVideoFile,
    setAboutVideoFile,
    aboutVideoPreview,
    setAboutVideoPreview,
    aboutVideoUrl,
    uploadingAboutVideo,
    loadingAboutVideo,
    handleUploadAboutVideo,
    handleRemoveAboutVideo,
    // Facility section
    aboutSectionHeading,
    setAboutSectionHeading,
    aboutSectionDescription,
    setAboutSectionDescription,
    aboutSectionImages,
    aboutSectionImagePreviews,
    savingAboutSection,
    handleAboutSectionImageChange,
    handleRemoveAboutSectionImage,
    handleResetAboutSectionDefaults,
    handleSaveAboutSection,
    // Science
    scienceHeading,
    setScienceHeading,
    scienceDescription,
    setScienceDescription,
    scienceBadgeImages,
    scienceBadgeImagePreviews,
    scienceImage,
    scienceImagePreview,
    savingScienceSection,
    handleScienceImageChange,
    handleRemoveScienceImage,
    handleScienceBadgeImageSelection,
    handleRemoveSavedScienceBadge,
    handleRemovePendingScienceBadge,
    handleResetScienceSectionDefaults,
    handleSaveScienceSection,
    // Why Nutrifactor
    whyNutrifactorHeading,
    setWhyNutrifactorHeading,
    whyNutrifactorDescription,
    setWhyNutrifactorDescription,
    whyNutrifactorImage,
    whyNutrifactorImagePreview,
    savingWhyNutrifactorSection,
    handleWhyNutrifactorImageChange,
    handleRemoveWhyNutrifactorImage,
    handleResetWhyNutrifactorSectionDefaults,
    handleSaveWhyNutrifactorSection,
    // Mission
    missionHeading,
    setMissionHeading,
    missionDescription,
    setMissionDescription,
    missionImage,
    missionImagePreview,
    savingMissionSection,
    handleMissionImageChange,
    handleRemoveMissionImage,
    handleResetMissionSectionDefaults,
    handleSaveMissionSection,
    // Health priority
    healthPriorityHeading,
    setHealthPriorityHeading,
    healthPriorityItems,
    healthPriorityImages,
    healthPriorityImagePreviews,
    savingHealthPrioritySection,
    handleHealthPriorityItemChange,
    handleHealthPriorityImageChange,
    handleRemoveHealthPriorityImage,
    handleResetHealthPrioritySectionDefaults,
    handleSaveHealthPrioritySection,
    // Team
    teamMembers,
    teamMemberImagePreviews,
    savingTeamMembers,
    handleTeamMemberChange,
    handleTeamMemberImageChange,
    handleRemoveTeamMemberImage,
    handleAddTeamMember,
    handleRemoveTeamMember,
    handleResetTeamMembersDefaults,
    handleSaveTeamMembers,
    // Fetch
    fetchAboutContent,
  };
};
