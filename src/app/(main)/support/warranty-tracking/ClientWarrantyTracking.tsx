"use client";

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
import { Button, Input, Card, Alert, Spin, Typography, Steps, Row, Col, Result } from "antd";
import React, { useState } from "react";

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

const WarrantyTrackingPage = () => {
  const [warrantyCode, setWarrantyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  type WarrantyResult = {
    status: "success" | "expired" | "already_requested";
    data?: {
      productType?: string;
      startDate: string;
      expiryDate: string;
      status: "Active" | "Expired" | "Requested";
      customerPhone?: string;
    };
    error?: string;
  };

  const [result, setResult] = useState<WarrantyResult | null>(null);
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
    } catch (err) {
      setError("خطا در بررسی گارانتی");
      throw err;
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
    } catch (err) {
      setError("خطا در ثبت درخواست گارانتی");
      throw err;
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
      console.error(error);
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
    <div className="warranty-page font-inherit w-full" style={{ direction: "rtl" }}>
      {loading ? (
        // Loading skeleton
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex justify-center">
            <div className="w-full md:w-2/3 lg:w-1/2 xl:w-2/5">
              <div className="mx-auto mb-2 h-8 w-3/4 animate-pulse rounded-md bg-gray-200"></div>
              <div className="mx-auto mb-10 h-4 w-4/5 animate-pulse rounded-md bg-gray-100"></div>

              <div className="mb-8 flex justify-between">
                <div className="h-16 w-1/3 animate-pulse rounded-full bg-blue-100"></div>
                <div className="h-16 w-1/3 animate-pulse rounded-full bg-gray-100"></div>
                <div className="h-16 w-1/3 animate-pulse rounded-full bg-gray-100"></div>
              </div>
            </div>
          </div>

          <div className="animate-pulse overflow-hidden rounded-lg border-0 bg-white shadow-lg">
            <div className="p-8">
              <div className="mb-4 h-6 w-1/3 rounded-md bg-gray-200"></div>
              <div className="mb-6 h-4 w-2/3 rounded-md bg-gray-100"></div>

              <div className="mb-6 flex gap-3">
                <div className="h-12 w-full rounded-md bg-gray-100"></div>
                <div className="h-12 w-24 rounded-md bg-blue-100"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl">
          <Row justify="center" className="font-inherit mb-8">
            <Col xs={24} md={18} lg={16} xl={14} className="font-inherit">
              <Title level={2} className="font-inherit mb-2 text-center">
                سامانه استعلام گارانتی محصولات
              </Title>
              <Paragraph className="font-inherit !mb-10 text-center text-gray-500">
                با وارد کردن کد گارانتی محصول، از وضعیت و اعتبار گارانتی خود مطلع شوید
              </Paragraph>

              <Steps current={currentStep} className="warranty-steps font-inherit mb-8">
                {stepsConfig.map((step, index) => (
                  <Step
                    key={index}
                    title={step.title}
                    description={step.description}
                    className="font-inherit"
                  />
                ))}
              </Steps>
            </Col>
          </Row>

          <Card
            className="font-inherit overflow-hidden rounded-lg border-0 shadow-lg"
            bodyStyle={{ padding: "24px 32px" }}
          >
            {currentStep === 0 && (
              <div className="mb-8">
                <Title level={4} className="font-inherit mb-4">
                  بررسی وضعیت گارانتی
                </Title>
                <Paragraph className="font-inherit text-gray-500">
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
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 18 }} spin />} />
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
                    className="font-inherit mb-6"
                  />
                )}
              </div>
            )}

            {currentStep === 1 && result && (
              <div className="mb-8">
                <Title level={4} className="font-inherit mb-4">
                  تایید اطلاعات گارانتی
                </Title>
                <Paragraph className="font-inherit mb-6 text-gray-500">
                  لطفا اطلاعات گارانتی خود را بررسی کرده و در صورت صحت، درخواست بررسی را تایید کنید
                </Paragraph>

                {result.data && (
                  <Card
                    className="font-inherit mb-6 border-t border-gray-200"
                    headStyle={{ borderBottom: "1px solid #f0f0f0" }}
                  >
                    <Row gutter={[16, 16]} className="font-inherit">
                      {result.data.productType && (
                        <Col span={24} className="font-inherit">
                          <div className="flex items-center">
                            <TagOutlined className="ml-2 text-indigo-500" />
                            <div>
                              <div className="font-inherit text-sm text-gray-500">نام محصول:</div>
                              <div className="font-inherit font-medium">
                                {result.data.productType}
                              </div>
                            </div>
                          </div>
                        </Col>
                      )}

                      <Col span={12} className="font-inherit">
                        <div className="flex items-center">
                          <CalendarFilled className="ml-2 text-blue-500" />
                          <div>
                            <div className="font-inherit text-sm text-gray-500">تاریخ شروع:</div>
                            <div className="font-inherit font-medium">
                              {formatDate(result.data.startDate)}
                            </div>
                          </div>
                        </div>
                      </Col>

                      <Col span={12} className="font-inherit">
                        <div className="flex items-center">
                          <CalendarFilled className="ml-2 text-purple-500" />
                          <div>
                            <div className="font-inherit text-sm text-gray-500">تاریخ انقضا:</div>
                            <div className="font-inherit font-medium">
                              {formatDate(result.data.expiryDate)}
                            </div>
                          </div>
                        </div>
                      </Col>

                      <Col span={12} className="font-inherit">
                        <div className="flex items-center">
                          <div className="ml-2">
                            <span className="font-inherit text-sm text-gray-500">کد گارانتی:</span>
                          </div>
                          <div className="font-inherit font-medium text-gray-800">
                            {warrantyCode}
                          </div>
                        </div>
                      </Col>

                      <Col span={12} className="font-inherit">
                        <div className="flex items-center">
                          <div className="ml-2">
                            <span className="font-inherit text-sm text-gray-500">وضعیت:</span>
                          </div>
                          <div className="font-medium">
                            {result.data.status === "Active" && (
                              <span className="font-inherit flex items-center text-green-500">
                                <CheckCircleFilled className="ml-1" /> فعال
                              </span>
                            )}
                            {result.data.status === "Expired" && (
                              <span className="font-inherit flex items-center text-red-500">
                                <CloseCircleFilled className="ml-1" /> منقضی شده
                              </span>
                            )}
                            {result.data.status === "Requested" && (
                              <span className="font-inherit flex items-center text-amber-500">
                                <ClockCircleFilled className="ml-1" /> درخواست بررسی
                              </span>
                            )}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                )}

                <div className="mt-8 flex justify-between">
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
                      <span className="font-inherit">درخواست بررسی گارانتی با موفقیت ثبت شد</span>
                    }
                    subTitle={
                      <div className="mt-4">
                        <Paragraph className="font-inherit text-lg text-gray-500">
                          اطلاعات گارانتی شما ثبت شده و کارشناسان ما در اسرع وقت با شماره{" "}
                          {result.data?.customerPhone || "شما"} تماس خواهند گرفت.
                        </Paragraph>

                        <div className="mt-8 flex flex-col items-center justify-center gap-2 rounded-lg bg-blue-100 p-4 md:flex-row md:gap-8">
                          <div className="flex items-center">
                            <PhoneFilled className="ml-2 text-blue-500" />
                            <Text className="font-inherit">در انتظار تماس کارشناسان</Text>
                          </div>
                          <div className="flex items-center">
                            <ClockCircleFilled className="ml-2 text-green-500" />
                            <Text className="font-inherit">زمان پاسخگویی: حداکثر 48 ساعت کاری</Text>
                          </div>
                        </div>
                      </div>
                    }
                    className="font-inherit"
                  />
                )}

                {result.status === "expired" && (
                  <Result
                    status="error"
                    title={<span className="font-inherit">گارانتی منقضی شده است</span>}
                    subTitle={
                      <div className="mt-2">
                        <Paragraph className="font-inherit text-gray-500">
                          متأسفانه مدت زمان گارانتی محصول شما به پایان رسیده است.
                        </Paragraph>
                      </div>
                    }
                    className="font-inherit"
                  />
                )}

                {result.status === "already_requested" && (
                  <Result
                    status="info"
                    title={<span className="font-inherit">درخواست قبلاً ثبت شده است</span>}
                    icon={<InfoCircleFilled className="text-blue-500" />}
                    subTitle={
                      <div className="mt-4">
                        <Paragraph className="font-inherit text-gray-500">
                          درخواست بررسی گارانتی این محصول قبلاً ثبت شده است. کارشناسان ما به زودی با
                          شما تماس خواهند گرفت.
                        </Paragraph>

                        <div className="mt-8 flex flex-col items-center justify-center gap-2 rounded-lg bg-blue-100 p-4 md:flex-row md:gap-8">
                          <div className="flex items-center">
                            <PhoneFilled className="ml-2 text-blue-500" />
                            <Text className="font-inherit">در انتظار تماس کارشناسان</Text>
                          </div>
                          <div className="flex items-center">
                            <ClockCircleFilled className="ml-2 text-green-500" />
                            <Text className="font-inherit">زمان پاسخگویی: حداکثر 48 ساعت کاری</Text>
                          </div>
                        </div>
                      </div>
                    }
                    className="font-inherit"
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
              <Text strong className="contact-number cursor-pointer text-blue-500">
                021-77500008
              </Text>{" "}
              تماس بگیرید
            </Paragraph>
          </div>
        </div>
      )}

      <style jsx global>{`
        .warranty-page {
          font-family: "IranYekan", sans-serif;
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

        /* Add missing Ant Design component styles */
        .ant-card,
        .ant-card-body,
        .ant-steps,
        .ant-steps-item,
        .ant-steps-item-container,
        .ant-form,
        .ant-form-item,
        .ant-form-item-label,
        .ant-form-item-control,
        .ant-spin,
        .ant-spin-text,
        .ant-result,
        .ant-result-icon,
        .ant-col,
        .ant-row,
        .ant-paragraph {
          font-family: inherit !important;
        }

        /* Target all Ant Design components */
        [class*="ant-"] {
          font-family: inherit !important;
        }

        @media (max-width: 576px) {
          .ant-steps-horizontal:not(.ant-steps-label-vertical) .ant-steps-item-description {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default WarrantyTrackingPage;
