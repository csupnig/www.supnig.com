module.exports = {

	development : {
		adminemail:'christopher@supnig.com',
		db: 'mongodb://localhost/blog',
		postsperpage:5,
		facebook: {
			clientID: "194935747224798",
			clientSecret: "356f4c3d963cce5585c420e82e195671",
			callbackURL: "http://localhost:8081/auth/facebook/callback"
		},

		google: {
			clientID: "{{PLACEHOLDER}}",
			clientSecret: "{{PLACEHOLDER}}",
			callbackURL: "{{PLACEHOLDER}}"
		}
	}
};