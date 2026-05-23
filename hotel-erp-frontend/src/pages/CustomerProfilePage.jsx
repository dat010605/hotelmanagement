import React, { useState, useEffect } from 'react';
import {
  Card, Form, Input, Button, Upload, Avatar, Typography, App,
  Divider, Row, Col, DatePicker, Tooltip, Tag
} from 'antd';
import {
  UserOutlined, CameraOutlined, LockOutlined, SaveOutlined,
  MailOutlined, CalendarOutlined, CheckCircleOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { useCustomerProfileStore } from '../store/useCustomerProfileStore';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const CustomerProfilePage = () => {
  const { t } = useTranslation();
  const { user } = useAdminAuthStore();
  const { getProfile, setDisplayName, setAvatarUrl } = useCustomerProfileStore();
  const { notification } = App.useApp();

  const email = user?.email || user?.Email || '';
  const profile = getProfile(email);

  const currentName = profile.displayName || user?.fullName || user?.FullName || user?.name || t('header.guest');
  const currentAvatar = profile.avatarUrl || user?.avatarUrl || user?.AvatarUrl || null;

  const [avatarUrl, setAvatarUrlLocal] = useState(currentAvatar);
  const [nameForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [savingName, setSavingName] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [dobLocked, setDobLocked] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await axiosClient.get('/UserProfile/my-profile');
        const data = res.data;
        const isLocked = data.dateOfBirthLocked === true;
        setDobLocked(isLocked);
        nameForm.setFieldsValue({
          fullName: data.fullName || currentName,
          dateOfBirth: data.dateOfBirth ? dayjs(data.dateOfBirth) : undefined,
        });
      } catch (err) {
        console.log('Không thể tải profile từ server:', err);
        nameForm.setFieldsValue({ fullName: currentName });
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSaveName = async (values) => {
    setSavingName(true);
    try {
      const payload = {
        fullName: values.fullName,
        phone: user?.phone || user?.Phone || null,
        dateOfBirth: (!dobLocked && values.dateOfBirth)
          ? values.dateOfBirth.format('YYYY-MM-DD')
          : null,
      };

      const res = await axiosClient.put('/UserProfile/update-profile', payload);

      if (res.data?.dateOfBirthLocked === true) {
        setDobLocked(true);
      }

      setDisplayName(email, values.fullName);
      notification.success({
        message: t('profilePage.saveSuccess'),
        description: !dobLocked && values.dateOfBirth
          ? t('profilePage.dobSavedDesc')
          : t('profilePage.nameSavedDesc'),
        placement: 'topRight'
      });
    } catch (err) {
      const errData = err.response?.data;
      const errMsg = (typeof errData === 'object' && errData?.message)
        ? errData.message
        : (typeof errData === 'string' ? errData : t('profilePage.serverSaveError'));

      if (errData?.code === 'DOB_LOCKED') {
        setDobLocked(true);
        notification.error({
          message: t('profilePage.dobLockedError'),
          description: errMsg,
          placement: 'topRight'
        });
        return;
      }

      setDisplayName(email, values.fullName);
      notification.warning({
        message: t('profilePage.localSaveWarning'),
        description: errMsg,
        placement: 'topRight'
      });
    } finally {
      setSavingName(false);
    }
  };

  const handleSavePassword = async (values) => {
    setSavingPw(true);
    try {
      await axiosClient.put('/UserProfile/change-password', {
        oldPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      notification.success({ message: t('profilePage.passwordSuccess'), placement: 'topRight' });
      passwordForm.resetFields();
    } catch (err) {
      const errData = err?.response?.data;
      const errMsg = (typeof errData === 'object' && errData?.message)
        ? errData.message
        : (typeof errData === 'string' ? errData : t('profilePage.passwordCheckError'));
      notification.error({
        message: t('profilePage.passwordFail'),
        description: errMsg,
        placement: 'topRight'
      });
    } finally {
      setSavingPw(false);
    }
  };

  const handleAvatarChange = (info) => {
    const file = info.file.originFileObj || info.file;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setAvatarUrlLocal(dataUrl);
      setAvatarUrl(email, dataUrl);
      notification.success({
        message: t('profilePage.avatarSuccess'),
        description: t('profilePage.avatarDesc'),
        placement: 'topRight'
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 20px' }}>
      <Title level={2} style={{ marginBottom: 8 }}>{t('profilePage.title')}</Title>
      <Text type="secondary">{t('profilePage.subtitle')}</Text>

      {/* AVATAR SECTION */}
      <Card style={{ borderRadius: 12, marginTop: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ position: 'relative' }}>
            <Avatar
              size={96}
              src={avatarUrl}
              icon={!avatarUrl && <UserOutlined />}
              style={{ background: '#1890ff', fontSize: 40 }}
            />
            <Upload
              showUploadList={false}
              accept="image/*"
              beforeUpload={() => false}
              onChange={handleAvatarChange}
            >
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                background: '#1890ff', borderRadius: '50%',
                width: 28, height: 28, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', border: '2px solid #fff'
              }}>
                <CameraOutlined style={{ color: '#fff', fontSize: 14 }} />
              </div>
            </Upload>
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>{currentName}</Title>
            <Text type="secondary"><MailOutlined /> {email || t('profilePage.noEmail')}</Text>
          </div>
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        {/* CHANGE NAME + DATE OF BIRTH */}
        <Col xs={24} md={12}>
          <Card
            title={<><UserOutlined /> {t('profilePage.changeName')}</>}
            style={{ borderRadius: 12, height: '100%' }}
          >
            <Form
              form={nameForm}
              layout="vertical"
              onFinish={handleSaveName}
              initialValues={{ fullName: currentName }}
            >
              <Form.Item
                name="fullName"
                label={t('profilePage.newName')}
                rules={[{ required: true, message: t('profilePage.nameRequired') }]}
              >
                <Input size="large" placeholder={t('profilePage.namePlaceholder')} prefix={<UserOutlined />} />
              </Form.Item>

              {/* DatePicker bị DISABLE nếu dobLocked = true */}
              <Form.Item
                name="dateOfBirth"
                label={
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CalendarOutlined style={{ color: '#c9a961' }} />
                    {t('profilePage.dob')}
                    {dobLocked ? (
                      <Tooltip title={t('profilePage.dobLockedTooltip')}>
                        <Tag
                          icon={<CheckCircleOutlined />}
                          color="success"
                          style={{ marginLeft: 6, fontSize: 11 }}
                        >
                          {t('profilePage.dobConfirmed')}
                        </Tag>
                      </Tooltip>
                    ) : (
                      <Tooltip title={t('profilePage.dobTooltip')}>
                        <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
                      </Tooltip>
                    )}
                  </span>
                }
              >
                <DatePicker
                  size="large"
                  style={{ width: '100%' }}
                  placeholder={dobLocked ? t('profilePage.dobLockedPlaceholder') : t('profilePage.dobPlaceholder')}
                  format="DD/MM/YYYY"
                  disabled={dobLocked}
                  disabledDate={(d) => d && d.isAfter(dayjs())}
                />
              </Form.Item>

              {/* Cảnh báo nếu chưa có DOB */}
              {!dobLocked && (
                <div style={{
                  background: '#fffbe6', border: '1px solid #ffe58f',
                  borderRadius: 8, padding: '8px 12px', marginBottom: 16, fontSize: 13
                }}>
                  ⚠️ <Text type="warning">
                    {t('profilePage.dobWarning')}
                  </Text>
                </div>
              )}

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary" htmlType="submit" block
                  loading={savingName || loadingProfile}
                  icon={<SaveOutlined />} size="large"
                >
                  {t('profilePage.saveBtn')}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* CHANGE PASSWORD */}
        <Col xs={24} md={12}>
          <Card title={<><LockOutlined /> {t('profilePage.changePassword')}</>} style={{ borderRadius: 12, height: '100%' }}>
            <Form form={passwordForm} layout="vertical" onFinish={handleSavePassword}>
              <Form.Item
                name="currentPassword" label={t('profilePage.currentPassword')}
                rules={[{ required: true, message: t('profilePage.currentPasswordRequired') }]}
              >
                <Input.Password size="large" placeholder="••••••••" prefix={<LockOutlined />} />
              </Form.Item>
              <Form.Item
                name="newPassword" label={t('profilePage.newPassword')}
                rules={[
                  { required: true, message: t('profilePage.newPasswordRequired') },
                  { min: 6, message: t('profilePage.passwordMinLength') }
                ]}
              >
                <Input.Password size="large" placeholder="••••••••" prefix={<LockOutlined />} />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label={t('profilePage.confirmPassword')}
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: t('profilePage.confirmPasswordRequired') },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                      return Promise.reject(new Error(t('profilePage.passwordMismatch')));
                    }
                  })
                ]}
              >
                <Input.Password size="large" placeholder="••••••••" prefix={<LockOutlined />} />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary" htmlType="submit" block
                  loading={savingPw} icon={<SaveOutlined />} size="large"
                  style={{ background: '#52c41a', borderColor: '#52c41a' }}
                >
                  {t('profilePage.changePasswordBtn')}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerProfilePage;
