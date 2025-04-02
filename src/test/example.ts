interface User {
	id: number;
	name: string;
	email?: string;
	age: number;
	roles: string[];
}

interface Address {
	street: string;
	city: string;
	postalCode: string;
	country?: string;
}

interface UserProfile extends User {
	address: Address;
	phoneNumber?: string;
	lastLogin: Date;
}
