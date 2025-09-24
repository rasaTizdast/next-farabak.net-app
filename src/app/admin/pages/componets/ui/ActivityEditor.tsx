import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // Icons for expand/collapse
import { IoIosCloseCircle } from "react-icons/io";

type ActivityEditModalProps = {
  onClose: () => void;
};

type Detail = {
  id?: number;
  activityID?: number;
  description: string;
};

type Activity = {
  id?: number;
  title: string;
  Details_activity: Detail[];
};

const ActivityEditor: React.FC<ActivityEditModalProps> = ({ onClose }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true); // Track data fetching state
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set<number>()); // Explicitly type the Set

  useEffect(() => {
    axios
      .get("/api/activities")
      .then((response) => {
        setActivities(response.data);
        // Expand all sections by default
        const defaultExpanded = new Set<number>(
          response.data.map((activity: Activity, index: number) => index)
        );
        setExpandedSections(defaultExpanded);
      })
      .catch((error) => {
        console.error("Failed to fetch activities:", error);
      })
      .finally(() => {
        setIsFetching(false); // Data fetching is complete
      });
  }, []);

  // Toggle section expansion
  const toggleSection = (index: number) => {
    const newExpandedSections = new Set<number>(expandedSections); // Explicitly type the Set
    if (newExpandedSections.has(index)) {
      newExpandedSections.delete(index); // Collapse section
    } else {
      newExpandedSections.add(index); // Expand section
    }
    setExpandedSections(newExpandedSections);
  };

  const handleAddSection = () => {
    setActivities([...activities, { title: "", Details_activity: [] }]);
    // Expand the newly added section
    setExpandedSections(
      new Set<number>([...Array.from(expandedSections), activities.length]) // Convert Set to Array before spreading
    );
  };

  const handleAddDetail = (activityIndex: number) => {
    const updatedActivities = [...activities];
    updatedActivities[activityIndex].Details_activity.push({
      description: "",
    });
    setActivities(updatedActivities);
  };

  const handleUpdateActivity = (index: number, field: "title", value: string) => {
    const updatedActivities = [...activities];
    updatedActivities[index][field] = value;
    setActivities(updatedActivities);
  };

  const handleUpdateDetail = (activityIndex: number, detailIndex: number, value: string) => {
    const updatedActivities = [...activities];
    updatedActivities[activityIndex].Details_activity[detailIndex].description = value;
    setActivities(updatedActivities);
  };

  const handleDeleteSection = (index: number) => {
    const updatedActivities = [...activities];
    updatedActivities.splice(index, 1);
    setActivities(updatedActivities);
    // Remove the section from expandedSections
    const newExpandedSections = new Set<number>(expandedSections);
    newExpandedSections.delete(index);
    setExpandedSections(newExpandedSections);
  };

  const handleDeleteDetail = (activityIndex: number, detailIndex: number) => {
    const updatedActivities = [...activities];
    updatedActivities[activityIndex].Details_activity.splice(detailIndex, 1);
    setActivities(updatedActivities);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const updatedActivities = activities.map((activity) => ({
        id: activity.id,
        title: activity.title,
        details: activity.Details_activity.map((detail) => ({
          id: detail.id || undefined,
          description: detail.description,
        })),
      }));

      await axios.put("/api/activities", updatedActivities);
      toast.success("فعالیت با موفقیت آپدیت شد!");
    } catch (error) {
      console.error(error);
      toast.error("آپدیت فعالیت به مشکل خورد!");
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  // Skeleton Loading Component
  const SkeletonLoader = () => (
    <div className="space-y-4">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="animate-pulse rounded-lg bg-gray-600 p-4">
          <div className="mb-4 h-6 w-1/2 rounded bg-gray-500"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="h-4 w-full rounded bg-gray-500"></div>
            ))}
          </div>
          <div className="mt-4 h-8 w-1/4 rounded bg-gray-500"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 shadow-lg backdrop-blur-sm">
      <div
        className="relative max-h-[95dvh] w-full max-w-7xl overflow-auto rounded-lg bg-gray-700 p-6 text-gray-200 shadow-lg"
        dir="rtl"
      >
        {/* Updated Close Button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 rounded-full p-2 text-red-500 hover:text-red-600"
        >
          <IoIosCloseCircle size={40} />
        </button>

        <h2 className="mb-10 text-center text-xl font-bold">ویرایش فعالیت‌ها</h2>
        {isFetching ? ( // Show skeleton while fetching data
          <SkeletonLoader />
        ) : (
          <>
            {activities.map((activity, activityIndex) => (
              <section
                key={activity.id}
                className="mb-4 rounded-lg border border-gray-500 bg-gray-800 p-4 shadow-md"
              >
                <div className="flex items-end justify-between">
                  <label className="flex w-full flex-col gap-2">
                    تیتر فعالیت
                    <input
                      type="text"
                      value={activity.title}
                      onChange={(e) => handleUpdateActivity(activityIndex, "title", e.target.value)}
                      placeholder="عنوان فعالیت"
                      className="mb-2 w-full rounded-lg bg-gray-600 p-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => toggleSection(activityIndex)}
                    className="mb-3 p-2 pl-0 text-gray-100 hover:text-blue-500"
                  >
                    {expandedSections.has(activityIndex) ? (
                      <FaChevronUp size={20} />
                    ) : (
                      <FaChevronDown size={20} />
                    )}
                  </button>
                </div>
                <button
                  onClick={() => handleDeleteSection(activityIndex)}
                  className="mb-3 mt-1 rounded-lg bg-red-500 p-2 text-gray-100 hover:bg-red-600"
                >
                  حذف فعالیت
                </button>
                {/* Conditionally Render Section Content */}
                {expandedSections.has(activityIndex) && (
                  <div className="mt-4 space-y-3">
                    {activity.Details_activity.map((detail, detailIndex) => (
                      <div
                        key={detail.id}
                        className="rounded-lg border border-gray-500 bg-gray-700 p-3 text-gray-100 shadow-md"
                      >
                        <label className="flex flex-col gap-2">
                          توضیح فعالیت
                          <textarea
                            rows={3}
                            value={detail.description}
                            onChange={(e) =>
                              handleUpdateDetail(activityIndex, detailIndex, e.target.value)
                            }
                            placeholder="توضیحات فعالیت"
                            className="w-full rounded-lg bg-gray-600 p-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </label>
                        <button
                          onClick={() => handleDeleteDetail(activityIndex, detailIndex)}
                          className="mt-3 rounded-lg bg-red-500 p-2 text-gray-100 hover:bg-red-600"
                        >
                          حذف جزئیات
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => handleAddDetail(activityIndex)}
                      className="mt-4 rounded-lg bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                    >
                      افزودن جزئیات جدید
                    </button>
                  </div>
                )}
              </section>
            ))}
            <div className="flex w-full justify-center">
              <button
                onClick={handleAddSection}
                className="mb-4 rounded-lg bg-blue-500 px-4 py-2 text-gray-100 hover:bg-blue-600"
              >
                افزودن فعالیت جدید
              </button>
            </div>

            <hr className="my-5" />

            <div className="flex w-full justify-center">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`${
                  isLoading ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"
                } mt-4 rounded-lg px-4 py-2 text-white transition-all`}
              >
                {isLoading ? "در حال ارسال..." : "ثبت تغییرات"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityEditor;
