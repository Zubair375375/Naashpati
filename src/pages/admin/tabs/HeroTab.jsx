import { FaCheck, FaImage, FaPlus, FaTrash } from "react-icons/fa";
import { resolveMediaUrl } from "../../../utils/mediaUrl";

const HeroTab = ({
  handleCreateHeroSlide,
  heroImagePreview,
  setHeroImageFile,
  setHeroImagePreview,
  heroForm,
  setHeroForm,
  uploadingHeroImage,
  heroBadgeImages,
  handleRemoveSavedHeroBadge,
  handleSaveHeroBadges,
  handleHeroBadgeImageSelection,
  heroBadgeImagePreviews,
  handleRemovePendingHeroBadge,
  updatingHeroBadges,
  handleSaveGenderImages,
  genderImagePreviews,
  heroGenderImages,
  handleGenderImageChange,
  handleRemoveGenderImage,
  savingGenderImages,
  heroSlides,
  handleDeleteHeroSlide,
}) => {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px,1fr]">
        <div className="space-y-6">
          <div className="rounded-lg border bg-gray-50 p-5">
            <h2 className="mb-4 text-2xl font-semibold">Add Hero Slide</h2>
            <form className="space-y-4" onSubmit={handleCreateHeroSlide}>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Hero Image
                </label>
                {heroImagePreview && (
                  <img
                    src={heroImagePreview}
                    alt="Hero preview"
                    className="mb-3 h-40 w-full rounded-lg object-cover"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) {
                      return;
                    }

                    setHeroImageFile(file);
                    const reader = new FileReader();
                    reader.onload = (event) =>
                      setHeroImagePreview(event.target.result);
                    reader.readAsDataURL(file);
                  }}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Display Order
                </label>
                <input
                  type="number"
                  value={heroForm.displayOrder}
                  onChange={(e) =>
                    setHeroForm((prev) => ({
                      ...prev,
                      displayOrder: e.target.value,
                    }))
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  min="0"
                />
              </div>

              <button
                type="submit"
                disabled={uploadingHeroImage}
                className="flex items-center space-x-2 rounded bg-[#68a300] px-4 py-2 text-white hover:bg-[#5f9600] disabled:opacity-60"
              >
                <FaPlus />
                <span>{uploadingHeroImage ? "Uploading..." : "Add Hero Slide"}</span>
              </button>
            </form>
          </div>

          <div className="rounded-lg border bg-gray-50 p-5">
            <h2 className="mb-4 text-2xl font-semibold">Hero Certificate Badges</h2>

            {heroBadgeImages.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Current Badges ({heroBadgeImages.length}/20)
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {heroBadgeImages.map((url, index) => (
                    <div
                      key={`current-badge-${index}`}
                      className="relative overflow-hidden rounded-full border"
                    >
                      <img
                        src={resolveMediaUrl(url)}
                        alt={`Badge ${index + 1}`}
                        className="h-14 w-14 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSavedHeroBadge(index)}
                        className="absolute right-0 top-0 bg-black/70 px-1 text-[10px] font-semibold text-white"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSaveHeroBadges}>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Add Certificate Badges
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleHeroBadgeImageSelection(e.target.files)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
                {heroBadgeImagePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {heroBadgeImagePreviews.map((preview, index) => (
                      <div
                        key={`hero-badge-preview-${index}`}
                        className="relative overflow-hidden rounded-full border"
                      >
                        <img
                          src={preview}
                          alt={`Hero badge preview ${index + 1}`}
                          className="h-14 w-14 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePendingHeroBadge(index)}
                          className="absolute right-0 top-0 bg-black/70 px-1 text-[10px] font-semibold text-white"
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={updatingHeroBadges}
                className="flex items-center space-x-2 rounded bg-[#5b3f95] px-4 py-2 text-white hover:bg-[#4d337f] disabled:opacity-60"
              >
                <FaPlus />
                <span>
                  {updatingHeroBadges ? "Saving..." : "Save Certificate Badges"}
                </span>
              </button>
            </form>
          </div>

          <div className="rounded-lg border bg-gray-50 p-5">
            <h2 className="mb-4 text-2xl font-semibold">Shop By Gender Images</h2>

            <form className="space-y-4" onSubmit={handleSaveGenderImages}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  { key: "female", label: "Female Collection" },
                  { key: "male", label: "Male Collection" },
                ].map(({ key, label }) => {
                  const preview =
                    genderImagePreviews[key] ||
                    resolveMediaUrl(heroGenderImages?.[key]);

                  return (
                    <div key={key} className="rounded-lg border bg-white p-3">
                      <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
                        {label}
                      </p>
                      {preview ? (
                        <img
                          src={preview}
                          alt={`${label} preview`}
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
                          handleGenderImageChange(key, e.target.files[0])
                        }
                        className="w-full rounded border border-gray-300 px-2 py-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGenderImage(key)}
                        className="mt-2 w-full rounded border border-red-200 px-2 py-2 text-xs text-red-600 hover:bg-red-50"
                      >
                        Clear
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                type="submit"
                disabled={savingGenderImages}
                className="flex items-center space-x-2 rounded bg-[#68a300] px-4 py-2 text-white hover:bg-[#5f9600] disabled:opacity-60"
              >
                <FaCheck />
                <span>
                  {savingGenderImages ? "Saving..." : "Save Gender Images"}
                </span>
              </button>
            </form>
          </div>
        </div>

        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Hero Slides</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaImage />
              <span>{heroSlides.length} slides</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {heroSlides.map((slide) => (
              <div
                key={slide._id}
                className="overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                <img
                  src={resolveMediaUrl(slide.image)}
                  alt="Hero slide"
                  className="h-44 w-full object-cover"
                />
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Order: {slide.displayOrder || 0}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteHeroSlide(slide._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {heroSlides.length === 0 && (
              <div className="rounded-xl border border-dashed p-8 text-center text-gray-400 md:col-span-2 xl:col-span-3">
                No hero slides yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroTab;
