import { FaCheck, FaTrash, FaVideo } from "react-icons/fa";
import { resolveMediaUrl } from "../../../utils/mediaUrl";

const AboutContentTab = ({
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
}) => {
  return (
    <div className="p-6 space-y-8">
      {/* ── Video ─────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px,1fr]">
        <div className="rounded-lg border bg-gray-50 p-5">
          <h2 className="mb-4 text-2xl font-semibold">About Page Video</h2>
          <form className="space-y-4" onSubmit={handleUploadAboutVideo}>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Upload Video
              </label>
              {aboutVideoPreview && (
                <video
                  src={aboutVideoPreview}
                  controls
                  className="mb-3 h-44 w-full rounded-lg border object-cover"
                />
              )}
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setAboutVideoFile(file);
                  if (aboutVideoPreview) URL.revokeObjectURL(aboutVideoPreview);
                  setAboutVideoPreview(URL.createObjectURL(file));
                }}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <p className="mt-2 text-xs text-gray-500">
                Supported: MP4/WebM/OGG, max size 100MB.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={uploadingAboutVideo}
                className="flex items-center space-x-2 rounded bg-[#68a300] px-4 py-2 text-white hover:bg-[#5f9600] disabled:opacity-60"
              >
                <FaVideo />
                <span>{uploadingAboutVideo ? "Saving..." : "Save Video"}</span>
              </button>
              <button
                type="button"
                onClick={handleRemoveAboutVideo}
                disabled={uploadingAboutVideo || !aboutVideoUrl}
                className="flex items-center space-x-2 rounded border border-red-200 bg-white px-4 py-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <FaTrash />
                <span>Remove</span>
              </button>
            </div>
          </form>
        </div>

        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Current About Video</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaVideo />
              <span>{aboutVideoUrl ? "Configured" : "Not Set"}</span>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border bg-white p-4 shadow-sm">
            {loadingAboutVideo ? (
              <div className="flex h-72 items-center justify-center text-gray-400">
                Loading...
              </div>
            ) : aboutVideoUrl ? (
              <video
                src={resolveMediaUrl(aboutVideoUrl)}
                controls
                className="h-72 w-full rounded-lg bg-black object-contain"
              />
            ) : (
              <div className="flex h-72 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400">
                No video uploaded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Facility / after-video section ───────────────────────────────────── */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">
            Section After Video Content
          </h2>
          <button
            type="button"
            onClick={handleResetAboutSectionDefaults}
            className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Reset Defaults
          </button>
        </div>
        <form className="space-y-6" onSubmit={handleSaveAboutSection}>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Heading
            </label>
            <input
              type="text"
              value={aboutSectionHeading}
              onChange={(e) => setAboutSectionHeading(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              maxLength={180}
              placeholder="Enter section heading"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Descriptive Paragraph
            </label>
            <textarea
              value={aboutSectionDescription}
              onChange={(e) => setAboutSectionDescription(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              rows={4}
              maxLength={1200}
              placeholder="Enter section paragraph"
            />
          </div>
          <div>
            <p className="mb-3 text-sm font-medium text-gray-700">
              Upload 3 Images
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[0, 1, 2].map((index) => {
                const preview =
                  aboutSectionImagePreviews[index] ||
                  resolveMediaUrl(aboutSectionImages[index]);
                return (
                  <div key={index} className="rounded-lg border bg-gray-50 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
                      Image {index + 1}
                    </p>
                    {preview ? (
                      <img
                        src={preview}
                        alt={`Section preview ${index + 1}`}
                        className="mb-3 h-28 w-full rounded object-cover"
                      />
                    ) : (
                      <div className="mb-3 flex h-28 items-center justify-center rounded border-2 border-dashed border-gray-300 text-xs text-gray-400">
                        No image selected
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleAboutSectionImageChange(index, e.target.files[0])
                      }
                      className="w-full rounded border border-gray-300 px-2 py-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAboutSectionImage(index)}
                      className="mt-2 w-full rounded border border-red-200 px-2 py-2 text-xs text-red-600 hover:bg-red-50"
                    >
                      Clear
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <button
            type="submit"
            disabled={savingAboutSection}
            className="inline-flex items-center space-x-2 rounded bg-[#68a300] px-4 py-2 text-white hover:bg-[#5f9600] disabled:opacity-60"
          >
            <FaCheck />
            <span>{savingAboutSection ? "Saving..." : "Save Section"}</span>
          </button>
        </form>
      </div>

      {/* ── Science section ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">
            "Backed by Science" Section Content
          </h2>
          <button
            type="button"
            onClick={handleResetScienceSectionDefaults}
            className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Reset Defaults
          </button>
        </div>
        <form className="space-y-6" onSubmit={handleSaveScienceSection}>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Heading
            </label>
            <input
              type="text"
              value={scienceHeading}
              onChange={(e) => setScienceHeading(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              maxLength={180}
              placeholder="e.g. We Are Backed By Science"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Descriptive Paragraph
            </label>
            <textarea
              value={scienceDescription}
              onChange={(e) => setScienceDescription(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              rows={4}
              maxLength={1200}
              placeholder="Enter descriptive paragraph"
            />
          </div>
          <div>
            <p className="mb-3 text-sm font-medium text-gray-700">
              Certification Badges (upload 1 or more)
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleScienceBadgeImageSelection(e.target.files)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {scienceBadgeImages.map((badge, index) => (
                <div key={`${badge}-${index}`} className="rounded border p-2">
                  <img
                    src={resolveMediaUrl(badge)}
                    alt={`Saved badge ${index + 1}`}
                    className="h-20 w-full rounded object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSavedScienceBadge(index)}
                    className="mt-2 w-full rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {scienceBadgeImagePreviews.map((preview, index) => (
                <div
                  key={`pending-${index}`}
                  className="rounded border border-[#68a300]/40 bg-[#f4faeb] p-2"
                >
                  <img
                    src={preview}
                    alt={`Pending badge ${index + 1}`}
                    className="h-20 w-full rounded object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePendingScienceBadge(index)}
                    className="mt-2 w-full rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-400">
              You can keep up to 8 badge images.
            </p>
          </div>
          <div>
            <p className="mb-3 text-sm font-medium text-gray-700">
              Section Image (upload 1 image)
            </p>
            {(scienceImagePreview || scienceImage) && (
              <img
                src={scienceImagePreview || resolveMediaUrl(scienceImage)}
                alt="Science section preview"
                className="mb-3 h-40 w-full max-w-sm rounded-lg border object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleScienceImageChange(e.target.files[0])}
              className="w-full max-w-sm rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleRemoveScienceImage}
              className="mt-2 rounded border border-red-200 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
            >
              Clear Section Image
            </button>
          </div>
          <button
            type="submit"
            disabled={savingScienceSection}
            className="inline-flex items-center space-x-2 rounded bg-[#68a300] px-4 py-2 text-white hover:bg-[#5f9600] disabled:opacity-60"
          >
            <FaCheck />
            <span>{savingScienceSection ? "Saving..." : "Save Section"}</span>
          </button>
        </form>
      </div>

      {/* ── Why Nutrifactor ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">Why Nutrifactor Section</h2>
          <button
            type="button"
            onClick={handleResetWhyNutrifactorSectionDefaults}
            className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Reset Defaults
          </button>
        </div>
        <form className="space-y-6" onSubmit={handleSaveWhyNutrifactorSection}>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Heading
            </label>
            <input
              type="text"
              value={whyNutrifactorHeading}
              onChange={(e) => setWhyNutrifactorHeading(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              maxLength={180}
              placeholder="e.g. WHY NUTRIFACTOR!"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Descriptive Paragraph
            </label>
            <textarea
              value={whyNutrifactorDescription}
              onChange={(e) => setWhyNutrifactorDescription(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              rows={5}
              maxLength={1400}
              placeholder="Enter Why Nutrifactor paragraph"
            />
          </div>
          <div>
            <p className="mb-3 text-sm font-medium text-gray-700">
              Section Image (upload 1 image)
            </p>
            {(whyNutrifactorImagePreview || whyNutrifactorImage) && (
              <img
                src={
                  whyNutrifactorImagePreview ||
                  resolveMediaUrl(whyNutrifactorImage)
                }
                alt="Why Nutrifactor preview"
                className="mb-3 h-44 w-full max-w-2xl rounded-lg border object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleWhyNutrifactorImageChange(e.target.files[0])
              }
              className="w-full max-w-sm rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleRemoveWhyNutrifactorImage}
              className="mt-2 rounded border border-red-200 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
            >
              Clear Section Image
            </button>
          </div>
          <button
            type="submit"
            disabled={savingWhyNutrifactorSection}
            className="inline-flex items-center space-x-2 rounded bg-[#68a300] px-4 py-2 text-white hover:bg-[#5f9600] disabled:opacity-60"
          >
            <FaCheck />
            <span>
              {savingWhyNutrifactorSection ? "Saving..." : "Save Section"}
            </span>
          </button>
        </form>
      </div>

      {/* ── Mission ──────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">Our Mission Section</h2>
          <button
            type="button"
            onClick={handleResetMissionSectionDefaults}
            className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Reset Defaults
          </button>
        </div>
        <form className="space-y-6" onSubmit={handleSaveMissionSection}>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Heading
            </label>
            <input
              type="text"
              value={missionHeading}
              onChange={(e) => setMissionHeading(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              maxLength={180}
              placeholder="Enter mission heading"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Descriptive Paragraph
            </label>
            <textarea
              value={missionDescription}
              onChange={(e) => setMissionDescription(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              rows={5}
              maxLength={1500}
              placeholder="Enter mission paragraph"
            />
          </div>
          <div>
            <p className="mb-3 text-sm font-medium text-gray-700">
              Section Image (upload 1 image)
            </p>
            {(missionImagePreview || missionImage) && (
              <img
                src={missionImagePreview || resolveMediaUrl(missionImage)}
                alt="Mission section preview"
                className="mb-3 h-44 w-full max-w-2xl rounded-lg border object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleMissionImageChange(e.target.files[0])}
              className="w-full max-w-sm rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleRemoveMissionImage}
              className="mt-2 rounded border border-red-200 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
            >
              Clear Section Image
            </button>
          </div>
          <button
            type="submit"
            disabled={savingMissionSection}
            className="inline-flex items-center space-x-2 rounded bg-[#68a300] px-4 py-2 text-white hover:bg-[#5f9600] disabled:opacity-60"
          >
            <FaCheck />
            <span>{savingMissionSection ? "Saving..." : "Save Section"}</span>
          </button>
        </form>
      </div>

      {/* ── Health priority ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">
            Your Health, Our Priority Section
          </h2>
          <button
            type="button"
            onClick={handleResetHealthPrioritySectionDefaults}
            className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Reset Defaults
          </button>
        </div>
        <form className="space-y-6" onSubmit={handleSaveHealthPrioritySection}>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Heading
            </label>
            <input
              type="text"
              value={healthPriorityHeading}
              onChange={(e) => setHealthPriorityHeading(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              maxLength={180}
              placeholder="e.g. YOUR HEALTH, OUR PRIORITY"
            />
          </div>
          {[0, 1, 2].map((index) => (
            <div
              key={`health-item-${index}`}
              className="rounded-lg border bg-gray-50 p-4"
            >
              <p className="mb-3 text-sm font-semibold text-gray-700">
                Text Block {index + 1}
              </p>
              <input
                type="text"
                value={healthPriorityItems[index]?.title || ""}
                onChange={(e) =>
                  handleHealthPriorityItemChange(index, "title", e.target.value)
                }
                className="mb-3 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                maxLength={180}
                placeholder="Title"
              />
              <textarea
                value={healthPriorityItems[index]?.description || ""}
                onChange={(e) =>
                  handleHealthPriorityItemChange(
                    index,
                    "description",
                    e.target.value,
                  )
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                rows={3}
                maxLength={1000}
                placeholder="Description"
              />
            </div>
          ))}
          <div>
            <p className="mb-3 text-sm font-medium text-gray-700">
              Image Grid (upload up to 4 images)
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[0, 1, 2, 3].map((index) => {
                const preview =
                  healthPriorityImagePreviews[index] ||
                  resolveMediaUrl(healthPriorityImages[index]);
                return (
                  <div
                    key={`health-image-${index}`}
                    className="rounded-lg border bg-gray-50 p-3"
                  >
                    <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
                      Image {index + 1}
                    </p>
                    {preview ? (
                      <img
                        src={preview}
                        alt={`Health Priority preview ${index + 1}`}
                        className="mb-3 h-32 w-full rounded object-cover"
                      />
                    ) : (
                      <div className="mb-3 flex h-32 items-center justify-center rounded border-2 border-dashed border-gray-300 text-xs text-gray-400">
                        No image selected
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleHealthPriorityImageChange(
                          index,
                          e.target.files[0],
                        )
                      }
                      className="w-full rounded border border-gray-300 px-2 py-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveHealthPriorityImage(index)}
                      className="mt-2 w-full rounded border border-red-200 px-2 py-2 text-xs text-red-600 hover:bg-red-50"
                    >
                      Clear
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <button
            type="submit"
            disabled={savingHealthPrioritySection}
            className="inline-flex items-center space-x-2 rounded bg-[#68a300] px-4 py-2 text-white hover:bg-[#5f9600] disabled:opacity-60"
          >
            <FaCheck />
            <span>
              {savingHealthPrioritySection ? "Saving..." : "Save Section"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AboutContentTab;
