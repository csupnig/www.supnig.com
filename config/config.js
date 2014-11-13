module.exports = {

	development : {
		adminemail:'christopher@supnig.com',
		db: 'mongodb://localhost/blog',
		postsperpage:5,
		facebook: {
			clientID: "277291162395670",
			clientSecret: "f42eb8c82b962f02d3b67ea0e5e09200",
			callbackURL: "http://www.supnig.com/auth/facebook/callback"
		},

		google: {
			clientID: "{{PLACEHOLDER}}",
			clientSecret: "{{PLACEHOLDER}}",
			callbackURL: "{{PLACEHOLDER}}"
		}
	}
};