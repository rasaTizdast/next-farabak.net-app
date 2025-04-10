"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import {
  Button,
  Input,
  Card,
  Alert,
  Spin,
  Typography,
  Steps,
  Row,
  Col,
  Result,
} from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  InfoCircleFilled,
  PhoneFilled,
  CalendarFilled,
  ClockCircleFilled,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  TagOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

export default function WarrantyTrackingPage() {
  const [warrantyCode, setWarrantyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleSearchWarranty = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/public/warranty-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ warrantycode: warrantyCode, checkOnly: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در بررسی گارانتی");
      }

      setResult(data);
      setCurrentStep(1); // Move to confirmation step
    } catch (err: any) {
      setError(err.message || "خطا در بررسی گارانتی");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRequest = async () => {
    setConfirmLoading(true);

    try {
      const response = await fetch("/api/public/warranty-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ warrantycode: warrantyCode, confirm: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در ثبت درخواست گارانتی");
      }

      setResult(data);
      setCurrentStep(2); // Move to the final step after confirmation
    } catch (err: any) {
      setError(err.message || "خطا در ثبت درخواست گارانتی");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset and go back to first step
    setCurrentStep(0);
    setResult(null);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("fa-IR").format(date);
    } catch (error) {
      return dateString;
    }
  };

  // Determine which steps to show based on result status
  const getStepsConfig = () => {
    if (!result) {
      return [
        { title: "استعلام", description: "وارد کردن کد گارانتی" },
        { title: "تایید", description: "تایید اطلاعات گارانتی" },
        { title: "نتیجه", description: "دریافت نتیجه" },
      ];
    }

    if (result.status === "expired") {
      return [
        { title: "استعلام", description: "وارد کردن کد گارانتی" },
        { title: "نتیجه", description: "گارانتی منقضی شده" },
      ];
    }

    return [
      { title: "استعلام", description: "وارد کردن کد گارانتی" },
      { title: "تایید", description: "تایید اطلاعات گارانتی" },
      { title: "نتیجه", description: "درخواست ثبت شده" },
    ];
  };

  const stepsConfig = getStepsConfig();

  return (
    <div className="w-full warranty-page" style={{ direction: "rtl" }}>
      <div className="max-w-4xl mx-auto">
        <Row justify="center" className="mb-8">
          <Col xs={24} md={18} lg={16} xl={14}>
            <Title level={2} className="text-center mb-2 font-inherit">
              سامانه استعلام گارانتی محصولات
            </Title>
            <Paragraph className="text-center text-gray-500 !mb-10 font-inherit">
              با وارد کردن کد گارانتی محصول، از وضعیت و اعتبار گارانتی خود مطلع
              شوید
            </Paragraph>

            <Steps current={currentStep} className="mb-8 warranty-steps">
              {stepsConfig.map((step, index) => (
                <Step
                  key={index}
                  title={step.title}
                  description={step.description}
                />
              ))}
            </Steps>
          </Col>
        </Row>

        <Card
          className="shadow-lg rounded-lg overflow-hidden border-0"
          bodyStyle={{ padding: "24px 32px" }}
        >
          {currentStep === 0 && (
            <div className="mb-8">
              <Title level={4} className="mb-4 font-inherit">
                بررسی وضعیت گارانتی
              </Title>
              <Paragraph className="text-gray-500 font-inherit">
                لطفا کد گارانتی محصول خود را در کادر زیر وارد کنید
              </Paragraph>

              <form onSubmit={handleSearchWarranty} className="mb-6">
                <div className="flex gap-3">
                  <Input
                    placeholder="کد گارانتی را وارد کنید"
                    value={warrantyCode}
                    onChange={(e) => setWarrantyCode(e.target.value)}
                    style={{
                      flex: 1,
                      textAlign: "left",
                      height: "46px",
                      fontSize: "16px",
                    }}
                    dir="ltr"
                    disabled={loading}
                    size="large"
                    className="font-inherit"
                  />
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={loading || !warrantyCode}
                    style={{
                      height: "46px",
                      fontSize: "16px",
                      minWidth: "120px",
                    }}
                    size="large"
                    className="font-inherit"
                  >
                    {loading ? (
                      <Spin
                        indicator={
                          <LoadingOutlined style={{ fontSize: 18 }} spin />
                        }
                      />
                    ) : (
                      "بررسی"
                    )}
                  </Button>
                </div>
              </form>

              {error && (
                <Alert
                  message="خطا در بررسی گارانتی"
                  description={error}
                  type="error"
                  showIcon
                  icon={<CloseCircleFilled />}
                  className="mb-6 font-inherit"
                />
              )}
            </div>
          )}

          {currentStep === 1 && result && (
            <div className="mb-8">
              <Title level={4} className="mb-4 font-inherit">
                تایید اطلاعات گارانتی
              </Title>
              <Paragraph className="text-gray-500 mb-6 font-inherit">
                لطفا اطلاعات گارانتی خود را بررسی کرده و در صورت صحت، درخواست
                بررسی را تایید کنید
              </Paragraph>

              {result.data && (
                <Card
                  className="mb-6 border-t border-gray-200"
                  headStyle={{ borderBottom: "1px solid #f0f0f0" }}
                >
                  <Row gutter={[16, 16]}>
                    {result.data.productType && (
                      <Col span={24}>
                        <div className="flex items-center">
                          <TagOutlined className="text-indigo-500 ml-2" />
                          <div>
                            <div className="text-gray-500 text-sm font-inherit">
                              نام محصول:
                            </div>
                            <div className="font-medium font-inherit">
                              {result.data.productType}
                            </div>
                          </div>
                        </div>
                      </Col>
                    )}

                    <Col span={12}>
                      <div className="flex items-center">
                        <CalendarFilled className="text-blue-500 ml-2" />
                        <div>
                          <div className="text-gray-500 text-sm font-inherit">
                            تاریخ شروع:
                          </div>
                          <div className="font-medium font-inherit">
                            {formatDate(result.data.startDate)}
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col span={12}>
                      <div className="flex items-center">
                        <CalendarFilled className="text-purple-500 ml-2" />
                        <div>
                          <div className="text-gray-500 text-sm font-inherit">
                            تاریخ انقضا:
                          </div>
                          <div className="font-medium font-inherit">
                            {formatDate(result.data.expiryDate)}
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col span={12}>
                      <div className="flex items-center">
                        <div className="ml-2">
                          <span className="text-gray-500 text-sm font-inherit">
                            کد گارانتی:
                          </span>
                        </div>
                        <div className="font-medium text-gray-800 font-inherit">
                          {warrantyCode}
                        </div>
                      </div>
                    </Col>

                    <Col span={12}>
                      <div className="flex items-center">
                        <div className="ml-2">
                          <span className="text-gray-500 text-sm font-inherit">
                            وضعیت:
                          </span>
                        </div>
                        <div className="font-medium">
                          {result.data.status === "Active" && (
                            <span className="text-green-500 flex items-center font-inherit">
                              <CheckCircleFilled className="ml-1" /> فعال
                            </span>
                          )}
                          {result.data.status === "Expired" && (
                            <span className="text-red-500 flex items-center font-inherit">
                              <CloseCircleFilled className="ml-1" /> منقضی شده
                            </span>
                          )}
                          {result.data.status === "Requested" && (
                            <span className="text-amber-500 flex items-center font-inherit">
                              <ClockCircleFilled className="ml-1" /> درخواست
                              بررسی
                            </span>
                          )}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              )}

              <div className="flex justify-between mt-8">
                <Button
                  onClick={handleCancel}
                  style={{ minWidth: "120px" }}
                  size="large"
                  icon={<ArrowRightOutlined />}
                  className="font-inherit"
                >
                  بازگشت
                </Button>

                <Button
                  type="primary"
                  onClick={handleConfirmRequest}
                  loading={confirmLoading}
                  style={{ minWidth: "180px" }}
                  size="large"
                  icon={<ArrowLeftOutlined style={{ marginRight: 8 }} />}
                  className="font-inherit"
                >
                  تایید و ثبت درخواست
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && result && (
            <div className="mt-6">
              {result.status === "success" && (
                <Result
                  status="success"
                  title={
                    <span className="font-inherit">
                      درخواست بررسی گارانتی با موفقیت ثبت شد
                    </span>
                  }
                  subTitle={
                    <div className="mt-4">
                      <Paragraph className="text-gray-500 text-lg font-inherit">
                        اطلاعات گارانتی شما ثبت شده و کارشناسان ما در اسرع وقت
                        با شماره {result.data?.customerPhone || "شما"} تماس
                        خواهند گرفت.
                      </Paragraph>

                      <div className="flex justify-center items-center flex-col md:flex-row gap-2 md:gap-8 mt-8 bg-blue-100 p-4 rounded-lg">
                        <div className="flex items-center">
                          <PhoneFilled className="text-blue-500 ml-2" />
                          <Text className="font-inherit">
                            در انتظار تماس کارشناسان
                          </Text>
                        </div>
                        <div className="flex items-center">
                          <ClockCircleFilled className="text-green-500 ml-2" />
                          <Text className="font-inherit">
                            زمان پاسخگویی: حداکثر 48 ساعت کاری
                          </Text>
                        </div>
                      </div>
                    </div>
                  }
                />
              )}

              {result.status === "expired" && (
                <Result
                  status="error"
                  title={
                    <span className="font-inherit">گارانتی منقضی شده است</span>
                  }
                  subTitle={
                    <div className="mt-2">
                      <Paragraph className="text-gray-500 font-inherit">
                        متأسفانه مدت زمان گارانتی محصول شما به پایان رسیده است.
                      </Paragraph>
                    </div>
                  }
                />
              )}

              {result.status === "already_requested" && (
                <Result
                  status="info"
                  title={
                    <span className="font-inherit">
                      درخواست قبلاً ثبت شده است
                    </span>
                  }
                  icon={<InfoCircleFilled className="text-blue-500" />}
                  subTitle={
                    <div className="mt-4">
                      <Paragraph className="text-gray-500 font-inherit">
                        درخواست بررسی گارانتی این محصول قبلاً ثبت شده است.
                        کارشناسان ما به زودی با شما تماس خواهند گرفت.
                      </Paragraph>

                      <div className="flex justify-center items-center flex-col md:flex-row gap-2 md:gap-8 mt-8 bg-blue-100 p-4 rounded-lg">
                        <div className="flex items-center">
                          <PhoneFilled className="text-blue-500 ml-2" />
                          <Text className="font-inherit">
                            در انتظار تماس کارشناسان
                          </Text>
                        </div>
                        <div className="flex items-center">
                          <ClockCircleFilled className="text-green-500 ml-2" />
                          <Text className="font-inherit">
                            زمان پاسخگویی: حداکثر 48 ساعت کاری
                          </Text>
                        </div>
                      </div>
                    </div>
                  }
                />
              )}

              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    setCurrentStep(0);
                    setWarrantyCode("");
                    setResult(null);
                  }}
                  size="large"
                  className="font-inherit mt-6"
                >
                  بررسی گارانتی دیگر
                </Button>
              </div>
            </div>
          )}
        </Card>

        <div className="mt-12 text-center text-gray-500">
          <Paragraph className="font-inherit">
            جهت اطلاعات بیشتر با شماره{" "}
            <Text
              strong
              className="text-blue-500 cursor-pointer contact-number"
            >
              021-77500008
            </Text>{" "}
            تماس بگیرید
          </Paragraph>
        </div>
      </div>

      <style jsx global>{`
        .warranty-page {
          font-family: "Vazirmatn", sans-serif;
        }

        .font-inherit {
          font-family: inherit !important;
        }

        .warranty-steps .ant-steps-item-title {
          font-weight: 500;
          font-family: inherit !important;
        }

        .warranty-steps .ant-steps-item-description {
          font-size: 12px;
          font-family: inherit !important;
        }

        .ant-result-title {
          font-size: 20px;
          font-weight: 600;
          font-family: inherit !important;
        }

        .ant-result-subtitle {
          font-family: inherit !important;
        }

        .ant-card-head-title {
          font-family: inherit !important;
        }

        .ant-typography {
          font-family: inherit !important;
        }

        .ant-btn {
          font-family: inherit !important;
        }

        .ant-input {
          font-family: inherit !important;
        }

        .ant-alert-message,
        .ant-alert-description {
          font-family: inherit !important;
        }

        .contact-number {
          unicode-bidi: plaintext;
          direction: ltr;
          display: inline-block;
        }

        .ant-result .ant-result-content {
          font-family: inherit !important;
        }

        @media (max-width: 576px) {
          .ant-steps-horizontal:not(.ant-steps-label-vertical)
            .ant-steps-item-description {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
