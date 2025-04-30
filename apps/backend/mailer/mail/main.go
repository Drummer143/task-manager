package mail

import (
	"crypto/tls"
	"html/template"
	"io"
	"os"
	"strings"

	"gopkg.in/gomail.v2"
)

var MailerInstance *gomail.Dialer

func init() {
	senderAddress := os.Getenv("EMAIL_ADDRESS")
	senderPassword := os.Getenv("EMAIL_PASSWORD")

	dialer := gomail.NewDialer("smtp.gmail.com", 587, senderAddress, senderPassword)
	dialer.TLSConfig = &tls.Config{InsecureSkipVerify: true}

	MailerInstance = dialer
}

// func (m *Mailer) Send(message ...*gomail.Message) error {
// 	return m.dialer.DialAndSend(message...)
// }

func createBody(body io.Writer, tmplFile string, data any) error {
	tmpl, err := template.ParseFiles(tmplFile)

	if err != nil {
		return err
	}

	return tmpl.Execute(body, data)
}

func createMessage(to string, body string, subject string) *gomail.Message {
	message := gomail.NewMessage()

	message.SetHeader("From", MailerInstance.Username)
	message.SetHeader("To", "<"+to+">")
	message.SetHeader("Subject", subject)

	message.SetBody("text/html", body)

	return message
}

func SendEmailConfirmationMessage(to string, token string) error {
	url := os.Getenv("CONFIRM_EMAIL_URL") + token

	var body strings.Builder

	if err := createBody(&body, "mail/templates/emailConfirmation.html", map[string]string{"ConfirmationLink": url}); err != nil {
		return err
	}

	return MailerInstance.DialAndSend(createMessage(to, body.String(), "Confirm your email address"))
}

func SendResetPasswordMessage(to string, token string) error {
	url := os.Getenv("RESET_PASSWORD_EMAIL_URL") + token

	var body strings.Builder

	if err := createBody(&body, "mail/templates/resetPassword.html", map[string]string{"ResetLink": url}); err != nil {
		return nil
	}

	return MailerInstance.DialAndSend(createMessage(to, body.String(), "Reset your password"))
}
