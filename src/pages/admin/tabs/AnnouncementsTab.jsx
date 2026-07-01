import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";

const AnnouncementsTab = ({
  announcements,
  handleOpenCreateAnnouncement,
  handleEditAnnouncement,
  handleDeleteAnnouncement,
}) => {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Announcements</h2>
        <button
          onClick={handleOpenCreateAnnouncement}
          className="flex items-center space-x-2 rounded bg-[#68a300] px-4 py-2 text-white hover:bg-[#5f9600]"
        >
          <FaPlus />
          <span>New Announcement</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Message
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Expires
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {announcements.map((ann) => (
              <tr key={ann._id}>
                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                  {ann.title}
                </td>
                <td className="max-w-xs truncate px-4 py-4 text-sm text-gray-500">
                  {ann.message}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`rounded px-2 py-1 text-xs capitalize ${
                      ann.type === "promo"
                        ? "bg-green-100 text-green-800"
                        : ann.type === "warning"
                          ? "bg-yellow-100 text-yellow-800"
                          : ann.type === "success"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {ann.type}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      ann.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {ann.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">
                  {ann.endDate ? new Date(ann.endDate).toLocaleDateString() : "Never"}
                </td>
                <td className="space-x-3 px-4 py-4 text-sm font-medium">
                  <button
                    onClick={() => handleEditAnnouncement(ann)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {announcements.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No announcements yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnnouncementsTab;
