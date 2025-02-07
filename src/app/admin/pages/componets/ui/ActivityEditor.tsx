import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoIosCloseCircle } from "react-icons/io";
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // Icons for expand/collapse

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
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set<number>()
  ); // Explicitly type the Set

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

  const handleUpdateActivity = (
    index: number,
    field: "title",
    value: string
  ) => {
    const updatedActivities = [...activities];
    updatedActivities[index][field] = value;
    setActivities(updatedActivities);
  };

  const handleUpdateDetail = (
    activityIndex: number,
    detailIndex: number,
    value: string
  ) => {
    const updatedActivities = [...activities];
    updatedActivities[activityIndex].Details_activity[detailIndex].description =
      value;
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
        <div key={index} className="bg-gray-600 p-4 rounded-lg animate-pulse">
          <div className="h-6 bg-gray-500 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="h-4 bg-gray-500 rounded w-full"></div>
            ))}
          </div>
          <div className="h-8 bg-gray-500 rounded w-1/4 mt-4"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm shadow-lg">
      <div
        className="bg-gray-700 text-gray-200 p-6 rounded-lg shadow-lg w-full max-w-7xl max-h-[95dvh] overflow-auto relative"
        dir="rtl"
      >
        {/* Updated Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full text-red-500 hover:text-red-600"
        >
          <IoIosCloseCircle size={40} />
        </button>

        <h2 className="text-xl text-center font-bold mb-10">ویرایش فعالیت‌ها</h2>
        {isFetching ? ( // Show skeleton while fetching data
          <SkeletonLoader />
        ) : (
          <>
            {activities.map((activity, activityIndex) => (
              <section
                key={activity.id}
                className="bg-gray-800 p-4 rounded-lg mb-4 border border-gray-500 shadow-md"
              >
                <div className="flex justify-between items-end">
                  <label className="flex flex-col gap-2 w-full">
                    تیتر فعالیت
                    <input
                      type="text"
                      value={activity.title}
                      onChange={(e) =>
                        handleUpdateActivity(
                          activityIndex,
                          "title",
                          e.target.value
                        )
                      }
                      placeholder="عنوان فعالیت"
                      className="w-full p-2 rounded-lg bg-gray-600 text-gray-100 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => toggleSection(activityIndex)}
                    className="p-2 pl-0 mb-3 text-gray-100 hover:text-blue-500"
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
                  className="bg-red-500 hover:bg-red-600 p-2 text-gray-100 rounded-lg mt-1 mb-3"
                >
                  حذف فعالیت
                </button>
                {/* Conditionally Render Section Content */}
                {expandedSections.has(activityIndex) && (
                  <div className="mt-4 space-y-3">
                    {activity.Details_activity.map((detail, detailIndex) => (
                      <div
                        key={detail.id}
                        className="bg-gray-700 text-gray-100 p-3 rounded-lg border border-gray-500 shadow-md"
                      >
                        <label className="flex flex-col gap-2">
                          توضیح فعالیت
                          <textarea
                            rows={3}
                            value={detail.description}
                            onChange={(e) =>
                              handleUpdateDetail(
                                activityIndex,
                                detailIndex,
                                e.target.value
                              )
                            }
                            placeholder="توضیحات فعالیت"
                            className="w-full p-2 rounded-lg bg-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </label>
                        <button
                          onClick={() =>
                            handleDeleteDetail(activityIndex, detailIndex)
                          }
                          className="bg-red-500 hover:bg-red-600 p-2 text-gray-100 rounded-lg mt-3"
                        >
                          حذف جزئیات
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => handleAddDetail(activityIndex)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg mt-4"
                    >
                      افزودن جزئیات جدید
                    </button>
                  </div>
                )}
              </section>
            ))}
            <div className="w-full flex justify-center">
              <button
                onClick={handleAddSection}
                className="bg-blue-500 hover:bg-blue-600 text-gray-100 px-4 py-2 rounded-lg mb-4"
              >
                افزودن فعالیت جدید
              </button>
            </div>

            <hr className="my-5" />

            <div className="w-full flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`${
                  isLoading ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"
                } text-white px-4 py-2 rounded-lg mt-4 transition-all`}
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
