'use client';

import { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  Camera,
  Shield,
  Bell,
  CreditCard,
  Globe,
  Moon,
  Sun,
  Smartphone,
  Laptop
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const CustomerProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-05-15',
    bio: 'Tech enthusiast and early adopter of new gadgets.',
    location: 'San Francisco, CA',
    joinDate: '2023-01-15'
  });

  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    currency: 'USD',
    timezone: 'PST',
    notifications: {
      email: true,
      push: true,
      sms: false,
      orderUpdates: true,
      promotions: true,
      recommendations: false,
      newsletter: true
    },
    privacy: {
      profileVisibility: 'private',
      showPurchaseHistory: false,
      showWishlist: false,
      dataCollection: true,
      targetedAds: false
    },
    shopping: {
      defaultShippingAddress: 'home',
      autoReorder: false,
      saveForLater: true,
      oneClickPurchase: false,
      emailReceipts: true
    }
  });

  const [devices, setDevices] = useState([
    {
      id: 1,
      name: 'iPhone 15 Pro',
      type: 'mobile',
      lastActive: '2024-01-15T10:30:00',
      location: 'San Francisco, CA',
      current: true
    },
    {
      id: 2,
      name: 'MacBook Pro',
      type: 'desktop',
      lastActive: '2024-01-14T16:45:00',
      location: 'San Francisco, CA',
      current: false
    },
    {
      id: 3,
      name: 'iPad Air',
      type: 'tablet',
      lastActive: '2024-01-13T09:15:00',
      location: 'San Francisco, CA',
      current: false
    }
  ]);

  const handleSave = () => {
    // Save profile data
    setIsEditing(false);
  };

  const handlePreferenceChange = (category: string, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const formatLastActive = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Smartphone className="w-4 h-4" />;
      case 'desktop': return <Laptop className="w-4 h-4" />;
      default: return <Smartphone className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading text-primary">My Profile</h1>
          <p className="text-muted">Manage your account settings and preferences</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="btn-primary flex items-center space-x-2">
            <Edit className="w-4 h-4" />
            <span>Edit Profile</span>
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            <Button onClick={() => setIsEditing(false)} variant="outline" className="btn-secondary">
              Cancel
            </Button>
            <Button onClick={handleSave} className="btn-primary flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="text-lg font-heading text-primary">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarFallback className="bg-teal-dark text-white text-xl">
                      {profileData.firstName[0]}{profileData.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button size="sm" className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 btn-primary">
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary">
                    {profileData.firstName} {profileData.lastName}
                  </h3>
                  <p className="text-muted">Member since {new Date(profileData.joinDate).toLocaleDateString()}</p>
                  <p className="text-sm text-teal-dark">Premium Customer</p>
                </div>
              </div>

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    disabled={!isEditing}
                    className={isEditing ? 'input-minimal' : 'bg-gray-50'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    disabled={!isEditing}
                    className={isEditing ? 'input-minimal' : 'bg-gray-50'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                      className={`pl-10 ${isEditing ? 'input-minimal' : 'bg-gray-50'}`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      className={`pl-10 ${isEditing ? 'input-minimal' : 'bg-gray-50'}`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      disabled={!isEditing}
                      className={`pl-10 ${isEditing ? 'input-minimal' : 'bg-gray-50'}`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                      className={`pl-10 ${isEditing ? 'input-minimal' : 'bg-gray-50'}`}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  className={isEditing ? 'input-minimal' : 'bg-gray-50'}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          {/* General Preferences */}
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="text-lg font-heading text-primary">General Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={preferences.theme} onValueChange={(value) => handlePreferenceChange('', 'theme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={preferences.language} onValueChange={(value) => handlePreferenceChange('', 'language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={preferences.currency} onValueChange={(value) => handlePreferenceChange('', 'currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={preferences.timezone} onValueChange={(value) => handlePreferenceChange('', 'timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                      <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                      <SelectItem value="CST">Central Time (CST)</SelectItem>
                      <SelectItem value="MST">Mountain Time (MST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="text-lg font-heading text-primary flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(preferences.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <p className="text-xs text-muted">
                      {key === 'email' && 'Receive notifications via email'}
                      {key === 'push' && 'Browser and mobile push notifications'}
                      {key === 'sms' && 'SMS notifications for urgent updates'}
                      {key === 'orderUpdates' && 'Updates about your orders'}
                      {key === 'promotions' && 'Special offers and deals'}
                      {key === 'recommendations' && 'Product recommendations'}
                      {key === 'newsletter' && 'Weekly newsletter and updates'}
                    </p>
                  </div>
                  <Switch
                    checked={value as boolean}
                    onCheckedChange={(checked) => handlePreferenceChange('notifications', key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Shopping Preferences */}
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="text-lg font-heading text-primary">Shopping Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(preferences.shopping).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <p className="text-xs text-muted">
                      {key === 'defaultShippingAddress' && 'Default shipping location'}
                      {key === 'autoReorder' && 'Automatically reorder frequently purchased items'}
                      {key === 'saveForLater' && 'Save items to wishlist when out of stock'}
                      {key === 'oneClickPurchase' && 'Enable one-click purchasing'}
                      {key === 'emailReceipts' && 'Send email receipts for purchases'}
                    </p>
                  </div>
                  {typeof value === 'boolean' ? (
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => handlePreferenceChange('shopping', key, checked)}
                    />
                  ) : (
                    <Select value={value as string} onValueChange={(newValue) => handlePreferenceChange('shopping', key, newValue)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Home</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy & Security Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="text-lg font-heading text-primary flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Privacy & Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(preferences.privacy).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <p className="text-xs text-muted">
                      {key === 'profileVisibility' && 'Who can see your profile information'}
                      {key === 'showPurchaseHistory' && 'Make your purchase history visible to others'}
                      {key === 'showWishlist' && 'Allow others to see your wishlist'}
                      {key === 'dataCollection' && 'Allow collection of usage data for improving services'}
                      {key === 'targetedAds' && 'Show personalized advertisements'}
                    </p>
                  </div>
                  {typeof value === 'boolean' ? (
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => handlePreferenceChange('privacy', key, checked)}
                    />
                  ) : (
                    <Select value={value as string} onValueChange={(newValue) => handlePreferenceChange('privacy', key, newValue)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Password & Security */}
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="text-lg font-heading text-primary">Password & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="btn-secondary">Change Password</Button>
              <Button className="btn-secondary">Enable Two-Factor Authentication</Button>
              <Button className="btn-secondary">Download Account Data</Button>
              <Button variant="destructive" className="text-red-600 hover:bg-red-50">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-6">
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="text-lg font-heading text-primary">Connected Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-beige-whisper rounded-lg">
                        {getDeviceIcon(device.type)}
                      </div>
                      <div>
                        <p className="font-medium text-primary">{device.name}</p>
                        <p className="text-sm text-muted">
                          Last active: {formatLastActive(device.lastActive)}
                        </p>
                        <p className="text-xs text-muted">{device.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {device.current && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Current
                        </span>
                      )}
                      {!device.current && (
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerProfile;
