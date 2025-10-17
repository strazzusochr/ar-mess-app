#!/usr/bin/env python3
"""
AR Mess-App Backend API Testing
Tests all measurement endpoints with comprehensive scenarios
"""

import requests
import json
import sys
from datetime import datetime

# Use the production URL from frontend/.env
BASE_URL = "https://dimensor.preview.emergentagent.com/api"

class ARMessAppTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.test_results = []
        self.created_measurement_ids = []
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        print()

    def test_root_endpoint(self):
        """Test GET /api/ - Root endpoint"""
        try:
            response = requests.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "AR Mess-App API" in data["message"]:
                    self.log_test("Root Endpoint", True, f"Response: {data}")
                else:
                    self.log_test("Root Endpoint", False, f"Unexpected response: {data}")
            else:
                self.log_test("Root Endpoint", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Root Endpoint", False, f"Exception: {str(e)}")

    def test_create_measurement_distance(self):
        """Test POST /api/measurements - Create distance measurement"""
        measurement_data = {
            "name": "Wohnzimmer Länge",
            "mode": "distance",
            "points": [
                {"x": 100, "y": 200, "id": "point1"},
                {"x": 300, "y": 400, "id": "point2"}
            ],
            "calibrationScale": 2.5,
            "result": {
                "distance": 350.5
            },
            "unit": "metric"
        }
        
        try:
            response = requests.post(f"{self.base_url}/measurements", json=measurement_data)
            if response.status_code == 200:
                data = response.json()
                if "id" in data and data["name"] == measurement_data["name"]:
                    self.created_measurement_ids.append(data["id"])
                    self.log_test("Create Distance Measurement", True, f"Created measurement ID: {data['id']}")
                    return data["id"]
                else:
                    self.log_test("Create Distance Measurement", False, f"Invalid response structure: {data}")
            else:
                self.log_test("Create Distance Measurement", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Create Distance Measurement", False, f"Exception: {str(e)}")
        return None

    def test_create_measurement_area(self):
        """Test POST /api/measurements - Create area measurement"""
        measurement_data = {
            "name": "Küche Fläche",
            "mode": "area",
            "points": [
                {"x": 0, "y": 0, "id": "corner1"},
                {"x": 400, "y": 0, "id": "corner2"},
                {"x": 400, "y": 300, "id": "corner3"},
                {"x": 0, "y": 300, "id": "corner4"}
            ],
            "calibrationScale": 1.8,
            "result": {
                "area": 120000,
                "perimeter": 1400
            },
            "unit": "metric"
        }
        
        try:
            response = requests.post(f"{self.base_url}/measurements", json=measurement_data)
            if response.status_code == 200:
                data = response.json()
                if "id" in data and data["name"] == measurement_data["name"]:
                    self.created_measurement_ids.append(data["id"])
                    self.log_test("Create Area Measurement", True, f"Created measurement ID: {data['id']}")
                    return data["id"]
                else:
                    self.log_test("Create Area Measurement", False, f"Invalid response structure: {data}")
            else:
                self.log_test("Create Area Measurement", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Create Area Measurement", False, f"Exception: {str(e)}")
        return None

    def test_create_measurement_volume(self):
        """Test POST /api/measurements - Create volume measurement"""
        measurement_data = {
            "name": "Schrank Volumen",
            "mode": "volume",
            "points": [
                {"x": 50, "y": 50, "id": "base1"},
                {"x": 250, "y": 50, "id": "base2"},
                {"x": 250, "y": 200, "id": "base3"},
                {"x": 50, "y": 200, "id": "base4"}
            ],
            "calibrationScale": 3.0,
            "result": {
                "volume": 180000,
                "area": 30000
            },
            "unit": "metric"
        }
        
        try:
            response = requests.post(f"{self.base_url}/measurements", json=measurement_data)
            if response.status_code == 200:
                data = response.json()
                if "id" in data and data["name"] == measurement_data["name"]:
                    self.created_measurement_ids.append(data["id"])
                    self.log_test("Create Volume Measurement", True, f"Created measurement ID: {data['id']}")
                    return data["id"]
                else:
                    self.log_test("Create Volume Measurement", False, f"Invalid response structure: {data}")
            else:
                self.log_test("Create Volume Measurement", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Create Volume Measurement", False, f"Exception: {str(e)}")
        return None

    def test_get_all_measurements(self):
        """Test GET /api/measurements - Get all measurements"""
        try:
            response = requests.get(f"{self.base_url}/measurements")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get All Measurements", True, f"Retrieved {len(data)} measurements")
                    return data
                else:
                    self.log_test("Get All Measurements", False, f"Expected list, got: {type(data)}")
            else:
                self.log_test("Get All Measurements", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Get All Measurements", False, f"Exception: {str(e)}")
        return None

    def test_get_single_measurement(self, measurement_id):
        """Test GET /api/measurements/{id} - Get single measurement"""
        if not measurement_id:
            self.log_test("Get Single Measurement", False, "No measurement ID provided")
            return None
            
        try:
            response = requests.get(f"{self.base_url}/measurements/{measurement_id}")
            if response.status_code == 200:
                data = response.json()
                if "id" in data and data["id"] == measurement_id:
                    self.log_test("Get Single Measurement", True, f"Retrieved measurement: {data['name']}")
                    return data
                else:
                    self.log_test("Get Single Measurement", False, f"ID mismatch or invalid structure: {data}")
            else:
                self.log_test("Get Single Measurement", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Get Single Measurement", False, f"Exception: {str(e)}")
        return None

    def test_export_json(self, measurement_id):
        """Test GET /api/measurements/export/{id}?format=json - JSON export"""
        if not measurement_id:
            self.log_test("Export JSON", False, "No measurement ID provided")
            return
            
        try:
            response = requests.get(f"{self.base_url}/measurements/export/{measurement_id}?format=json")
            if response.status_code == 200:
                data = response.json()
                if "id" in data and data["id"] == measurement_id:
                    self.log_test("Export JSON", True, f"Exported measurement as JSON")
                else:
                    self.log_test("Export JSON", False, f"Invalid JSON export structure: {data}")
            else:
                self.log_test("Export JSON", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Export JSON", False, f"Exception: {str(e)}")

    def test_export_csv(self, measurement_id):
        """Test GET /api/measurements/export/{id}?format=csv - CSV export"""
        if not measurement_id:
            self.log_test("Export CSV", False, "No measurement ID provided")
            return
            
        try:
            response = requests.get(f"{self.base_url}/measurements/export/{measurement_id}?format=csv")
            if response.status_code == 200:
                data = response.json()
                if "name" in data and "mode" in data and "result" in data:
                    self.log_test("Export CSV", True, f"Exported measurement as CSV format")
                else:
                    self.log_test("Export CSV", False, f"Invalid CSV export structure: {data}")
            else:
                self.log_test("Export CSV", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Export CSV", False, f"Exception: {str(e)}")

    def test_delete_measurement(self, measurement_id):
        """Test DELETE /api/measurements/{id} - Delete measurement"""
        if not measurement_id:
            self.log_test("Delete Measurement", False, "No measurement ID provided")
            return
            
        try:
            response = requests.delete(f"{self.base_url}/measurements/{measurement_id}")
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "deleted" in data["message"].lower():
                    self.log_test("Delete Measurement", True, f"Deleted measurement ID: {measurement_id}")
                else:
                    self.log_test("Delete Measurement", False, f"Unexpected delete response: {data}")
            else:
                self.log_test("Delete Measurement", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Delete Measurement", False, f"Exception: {str(e)}")

    def test_error_handling(self):
        """Test error handling with invalid requests"""
        # Test getting non-existent measurement
        try:
            response = requests.get(f"{self.base_url}/measurements/non-existent-id")
            if response.status_code == 404:
                self.log_test("Error Handling - Non-existent ID", True, "Correctly returned 404")
            else:
                self.log_test("Error Handling - Non-existent ID", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Error Handling - Non-existent ID", False, f"Exception: {str(e)}")

        # Test deleting non-existent measurement
        try:
            response = requests.delete(f"{self.base_url}/measurements/non-existent-id")
            if response.status_code == 404:
                self.log_test("Error Handling - Delete Non-existent", True, "Correctly returned 404")
            else:
                self.log_test("Error Handling - Delete Non-existent", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Error Handling - Delete Non-existent", False, f"Exception: {str(e)}")

        # Test invalid measurement data
        try:
            invalid_data = {"invalid": "data"}
            response = requests.post(f"{self.base_url}/measurements", json=invalid_data)
            if response.status_code in [400, 422]:  # FastAPI returns 422 for validation errors
                self.log_test("Error Handling - Invalid Data", True, f"Correctly returned {response.status_code}")
            else:
                self.log_test("Error Handling - Invalid Data", False, f"Expected 400/422, got {response.status_code}")
        except Exception as e:
            self.log_test("Error Handling - Invalid Data", False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("=" * 60)
        print("AR MESS-APP BACKEND API TESTING")
        print("=" * 60)
        print(f"Testing against: {self.base_url}")
        print()

        # Test root endpoint
        self.test_root_endpoint()

        # Create measurements
        distance_id = self.test_create_measurement_distance()
        area_id = self.test_create_measurement_area()
        volume_id = self.test_create_measurement_volume()

        # Test getting all measurements
        self.test_get_all_measurements()

        # Test getting single measurements
        if distance_id:
            self.test_get_single_measurement(distance_id)
            self.test_export_json(distance_id)
            self.test_export_csv(distance_id)

        if area_id:
            self.test_get_single_measurement(area_id)

        # Test error handling
        self.test_error_handling()

        # Clean up - delete created measurements
        for measurement_id in self.created_measurement_ids:
            self.test_delete_measurement(measurement_id)

        # Print summary
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if "✅ PASS" in result["status"])
        failed = sum(1 for result in self.test_results if "❌ FAIL" in result["status"])
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        
        if failed > 0:
            print("\nFAILED TESTS:")
            for result in self.test_results:
                if "❌ FAIL" in result["status"]:
                    print(f"- {result['test']}: {result['details']}")
        
        return passed, failed

if __name__ == "__main__":
    tester = ARMessAppTester()
    passed, failed = tester.run_all_tests()
    
    # Exit with error code if any tests failed
    sys.exit(0 if failed == 0 else 1)