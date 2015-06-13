module.exports = {

	development : {
		blogcategories:['travel','tech','lifestyle'],
		featuredpost:'get-your-metal-tested-test-angularjs-and-typescript-with-karma-and-jasmine',
		adminemail:'christopher@supnig.com',
		db: 'mongodb://localhost/blog',
		postsperpage:5,
		sendmail:"/usr/sbin/sendmail",
		facebook: {
			clientID: "194935747224798",
			clientSecret: "356f4c3d963cce5585c420e82e195671",
			callbackURL: "http://www.supnig.com/auth/facebook/callback"
		},

		google: {
			clientID: "{{PLACEHOLDER}}",
			clientSecret: "{{PLACEHOLDER}}",
			callbackURL: "{{PLACEHOLDER}}"
		}
	}
};