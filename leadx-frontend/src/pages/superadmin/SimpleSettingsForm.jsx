import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useColorContext } from '../../context/ColorContext';

const SimpleSettingsForm = () => {
    const { 
        adminDashboardColor, 
        ambassadorDashboardColor,
        adminTextColor,
        ambassadorTextColor,
        updateAdminDashboardColor, 
        updateAmbassadorDashboardColor,
        updateAdminTextColor,
        updateAmbassadorTextColor
    } = useColorContext();

    const [adminColor, setAdminColor] = useState(adminDashboardColor);
    const [ambassadorColor, setAmbassadorColor] = useState(ambassadorDashboardColor);
    const [adminText, setAdminText] = useState(adminTextColor || '#000000');
    const [ambassadorText, setAmbassadorText] = useState(ambassadorTextColor || '#000000');
    const [adminFormat, setAdminFormat] = useState('hex');
    const [ambassadorFormat, setAmbassadorFormat] = useState('hex');
    const [adminTextFormat, setAdminTextFormat] = useState('hex');
    const [ambassadorTextFormat, setAmbassadorTextFormat] = useState('hex');


    // Convert hex to RGB
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null;
    };

    // Convert RGB to hex
    const rgbToHex = (rgb) => {
        const result = rgb.match(/\d+/g);
        if (result && result.length === 3) {
            const r = parseInt(result[0]);
            const g = parseInt(result[1]);
            const b = parseInt(result[2]);
            return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        }
        return null;
    };

    const handleAdminColorChange = (color) => {
        setAdminColor(color);
        updateAdminDashboardColor(color);
    };

    const handleAmbassadorColorChange = (color) => {
        setAmbassadorColor(color);
        updateAmbassadorDashboardColor(color);
    };

    const handleAdminTextChange = (color) => {
        setAdminText(color);
        updateAdminTextColor(color);
    };

    const handleAmbassadorTextChange = (color) => {
        setAmbassadorText(color);
        updateAmbassadorTextColor(color);
    };

    const handleFormatChange = (type, format) => {
        if (type === 'admin') {
            setAdminFormat(format);
            if (format === 'hex' && adminColor.startsWith('rgb')) {
                const hex = rgbToHex(adminColor);
                if (hex) {
                    setAdminColor(hex);
                    updateAdminDashboardColor(hex);
                }
            } else if (format === 'rgb' && adminColor.startsWith('#')) {
                const rgb = hexToRgb(adminColor);
                if (rgb) {
                    setAdminColor(rgb);
                    updateAdminDashboardColor(rgb);
                }
            }
        } else if (type === 'ambassador') {
            setAmbassadorFormat(format);
            if (format === 'hex' && ambassadorColor.startsWith('rgb')) {
                const hex = rgbToHex(ambassadorColor);
                if (hex) {
                    setAmbassadorColor(hex);
                    updateAmbassadorDashboardColor(hex);
                }
            } else if (format === 'rgb' && ambassadorColor.startsWith('#')) {
                const rgb = hexToRgb(ambassadorColor);
                if (rgb) {
                    setAmbassadorColor(rgb);
                    updateAmbassadorDashboardColor(rgb);
                }
            }
        } else if (type === 'adminText') {
            setAdminTextFormat(format);
            if (format === 'hex' && adminText && adminText.startsWith('rgb')) {
                const hex = rgbToHex(adminText);
                if (hex) {
                    setAdminText(hex);
                    updateAdminTextColor(hex);
                }
            } else if (format === 'rgb' && adminText && adminText.startsWith('#')) {
                const rgb = hexToRgb(adminText);
                if (rgb) {
                    setAdminText(rgb);
                    updateAdminTextColor(rgb);
                }
            }
        } else if (type === 'ambassadorText') {
            setAmbassadorTextFormat(format);
            if (format === 'hex' && ambassadorText && ambassadorText.startsWith('rgb')) {
                const hex = rgbToHex(ambassadorText);
                if (hex) {
                    setAmbassadorText(hex);
                    updateAmbassadorTextColor(hex);
                }
            } else if (format === 'rgb' && ambassadorText && ambassadorText.startsWith('#')) {
                const rgb = hexToRgb(ambassadorText);
                if (rgb) {
                    setAmbassadorText(rgb);
                    updateAmbassadorTextColor(rgb);
                }
            }
        }
    };

    const handleSave = () => {
        // Show success message
        toast.success('✅ Customization saved successfully! Your dashboard colors have been updated.');
        
        // Optional: You can add additional save logic here
        // For example, sending to backend, showing toast notification, etc.
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Dashboard Settings</h2>
                <p className="text-slate-600">Customize your dashboard colors with simple controls</p>
            </div>

            {/* Admin Dashboard Settings */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Admin Dashboard Color</h3>
                </div>

                {/* Color Format Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Color Format</label>
                    <div className="flex space-x-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="adminFormat"
                                value="hex"
                                checked={adminFormat === 'hex'}
                                onChange={(e) => handleFormatChange('admin', e.target.value)}
                                className="mr-2"
                            />
                            <span className="text-sm text-slate-700">HEX</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="adminFormat"
                                value="rgb"
                                checked={adminFormat === 'rgb'}
                                onChange={(e) => handleFormatChange('admin', e.target.value)}
                                className="mr-2"
                            />
                            <span className="text-sm text-slate-700">RGB</span>
                        </label>
                    </div>
                </div>

                {/* Background Color Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Background Color</label>
                    <div className="flex items-center space-x-3">
                        <input
                            type="color"
                            value={adminColor.startsWith('#') ? adminColor : rgbToHex(adminColor) || '#3B82F6'}
                            onChange={(e) => handleAdminColorChange(adminFormat === 'hex' ? e.target.value : hexToRgb(e.target.value))}
                            className="w-12 h-12 rounded-lg border-2 border-slate-300 cursor-pointer"
                        />
                        <input
                            type="text"
                            value={adminColor}
                            onChange={(e) => handleAdminColorChange(e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={adminFormat === 'hex' ? '#3B82F6' : 'rgb(59, 130, 246)'}
                        />
                    </div>
                </div>

                {/* Text Color Format Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Text Color Format</label>
                    <div className="flex space-x-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="adminTextFormat"
                                value="hex"
                                checked={adminTextFormat === 'hex'}
                                onChange={(e) => handleFormatChange('adminText', e.target.value)}
                                className="mr-2"
                            />
                            <span className="text-sm text-slate-700">HEX</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="adminTextFormat"
                                value="rgb"
                                checked={adminTextFormat === 'rgb'}
                                onChange={(e) => handleFormatChange('adminText', e.target.value)}
                                className="mr-2"
                            />
                            <span className="text-sm text-slate-700">RGB</span>
                        </label>
                    </div>
                </div>

                {/* Text Color Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Text Color</label>
                    <div className="flex items-center space-x-3">
                        <input
                            type="color"
                            value={adminText && adminText.startsWith('#') ? adminText : rgbToHex(adminText) || '#FFFFFF'}
                            onChange={(e) => handleAdminTextChange(adminTextFormat === 'hex' ? e.target.value : hexToRgb(e.target.value))}
                            className="w-12 h-12 rounded-lg border-2 border-slate-300 cursor-pointer"
                        />
                        <input
                            type="text"
                            value={adminText}
                            onChange={(e) => handleAdminTextChange(e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={adminTextFormat === 'hex' ? '#FFFFFF' : 'rgb(255, 255, 255)'}
                        />
                    </div>
                </div>

            </div>

            {/* Ambassador Dashboard Settings */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Ambassador Dashboard Color</h3>
                </div>

                {/* Color Format Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Color Format</label>
                    <div className="flex space-x-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="ambassadorFormat"
                                value="hex"
                                checked={ambassadorFormat === 'hex'}
                                onChange={(e) => handleFormatChange('ambassador', e.target.value)}
                                className="mr-2"
                            />
                            <span className="text-sm text-slate-700">HEX</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="ambassadorFormat"
                                value="rgb"
                                checked={ambassadorFormat === 'rgb'}
                                onChange={(e) => handleFormatChange('ambassador', e.target.value)}
                                className="mr-2"
                            />
                            <span className="text-sm text-slate-700">RGB</span>
                        </label>
                    </div>
                </div>

                {/* Background Color Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Background Color</label>
                    <div className="flex items-center space-x-3">
                        <input
                            type="color"
                            value={ambassadorColor.startsWith('#') ? ambassadorColor : rgbToHex(ambassadorColor) || '#10B981'}
                            onChange={(e) => handleAmbassadorColorChange(ambassadorFormat === 'hex' ? e.target.value : hexToRgb(e.target.value))}
                            className="w-12 h-12 rounded-lg border-2 border-slate-300 cursor-pointer"
                        />
                        <input
                            type="text"
                            value={ambassadorColor}
                            onChange={(e) => handleAmbassadorColorChange(e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder={ambassadorFormat === 'hex' ? '#10B981' : 'rgb(16, 185, 129)'}
                        />
                    </div>
                </div>

                {/* Text Color Format Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Text Color Format</label>
                    <div className="flex space-x-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="ambassadorTextFormat"
                                value="hex"
                                checked={ambassadorTextFormat === 'hex'}
                                onChange={(e) => handleFormatChange('ambassadorText', e.target.value)}
                                className="mr-2"
                            />
                            <span className="text-sm text-slate-700">HEX</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="ambassadorTextFormat"
                                value="rgb"
                                checked={ambassadorTextFormat === 'rgb'}
                                onChange={(e) => handleFormatChange('ambassadorText', e.target.value)}
                                className="mr-2"
                            />
                            <span className="text-sm text-slate-700">RGB</span>
                        </label>
                    </div>
                </div>

                {/* Text Color Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Text Color</label>
                    <div className="flex items-center space-x-3">
                        <input
                            type="color"
                            value={ambassadorText && ambassadorText.startsWith('#') ? ambassadorText : rgbToHex(ambassadorText) || '#FFFFFF'}
                            onChange={(e) => handleAmbassadorTextChange(ambassadorTextFormat === 'hex' ? e.target.value : hexToRgb(e.target.value))}
                            className="w-12 h-12 rounded-lg border-2 border-slate-300 cursor-pointer"
                        />
                        <input
                            type="text"
                            value={ambassadorText}
                            onChange={(e) => handleAmbassadorTextChange(e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder={ambassadorTextFormat === 'hex' ? '#FFFFFF' : 'rgb(255, 255, 255)'}
                        />
                    </div>
                </div>

            </div>

            {/* Preview Section */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-center mb-2">
                            <div 
                                className="w-4 h-4 rounded mr-2"
                                style={{ backgroundColor: adminColor }}
                            ></div>
                            <span className="text-sm font-medium text-slate-700">Admin Dashboard</span>
                        </div>
                        <div className="space-y-1">
                            <div 
                                className="h-4 rounded flex items-center justify-center"
                                style={{ backgroundColor: adminColor, opacity: 0.4 }}
                            >
                                <span 
                                    className="text-xs font-medium"
                                    style={{ color: adminText }}
                                >
                                    Sample Text
                                </span>
                            </div>
                            <div 
                                className="h-2 rounded"
                                style={{ backgroundColor: adminColor, opacity: 0.3 }}
                            ></div>
                            <div 
                                className="h-2 rounded"
                                style={{ backgroundColor: adminColor, opacity: 0.2 }}
                            ></div>
                        </div>
                    </div>
                    <div className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-center mb-2">
                            <div 
                                className="w-4 h-4 rounded mr-2"
                                style={{ backgroundColor: ambassadorColor }}
                            ></div>
                            <span className="text-sm font-medium text-slate-700">Ambassador Dashboard</span>
                        </div>
                        <div className="space-y-1">
                            <div 
                                className="h-4 rounded flex items-center justify-center"
                                style={{ backgroundColor: ambassadorColor, opacity: 0.4 }}
                            >
                                <span 
                                    className="text-xs font-medium"
                                    style={{ color: ambassadorText }}
                                >
                                    Sample Text
                                </span>
                            </div>
                            <div 
                                className="h-2 rounded"
                                style={{ backgroundColor: ambassadorColor, opacity: 0.3 }}
                            ></div>
                            <div 
                                className="h-2 rounded"
                                style={{ backgroundColor: ambassadorColor, opacity: 0.2 }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Save Button */}
            <div className="flex justify-center mt-8">
                <button
                    onClick={handleSave}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Generate
                </button>
            </div>
        </div>
    );
};

export default SimpleSettingsForm;
