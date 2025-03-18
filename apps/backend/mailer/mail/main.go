package mail

import (
	"crypto/tls"
	"html/template"
	"io"
	"os"
	"strings"

	"gopkg.in/gomail.v2"
)

type Mailer struct {
	dialer *gomail.Dialer
}

func New() *Mailer {
	senderAddress := os.Getenv("EMAIL_ADDRESS")
	senderPassword := os.Getenv("EMAIL_PASSWORD")

	dialer := gomail.NewDialer("smtp.gmail.com", 587, senderAddress, senderPassword)
	dialer.TLSConfig = &tls.Config{InsecureSkipVerify: true}

	return &Mailer{
		dialer: dialer,
	}
}

// func (m *Mailer) Send(message ...*gomail.Message) error {
// 	return m.dialer.DialAndSend(message...)
// }

func (m *Mailer) createBody(body io.Writer, tmplFile string, data any) error {
	tmpl, err := template.ParseFiles(tmplFile)

	if err != nil {
		return err
	}

	return tmpl.Execute(body, data)
}

func (m *Mailer) createMessage(to string, body string, subject string) *gomail.Message {
	message := gomail.NewMessage()

	message.SetHeader("From", m.dialer.Username)
	message.SetHeader("To", "<"+to+">")
	message.SetHeader("Subject", subject)

	message.SetBody("text/html", body)

	return message
}

func (m *Mailer) SendEmailConfirmationMessage(to string, token string) error {
	url := os.Getenv("CONFIRM_EMAIL_URL") + token

	var body strings.Builder

	if err := m.createBody(&body, "mail/templates/emailConfirmation.html", map[string]string{"ConfirmationLink": url}); err != nil {
		return err
	}

	return m.dialer.DialAndSend(m.createMessage(to, body.String(), "Confirm your email address"))
}

func (m *Mailer) SendResetPasswordMessage(to string, token string) error {
	url := os.Getenv("RESET_PASSWORD_EMAIL_URL") + token

	var body strings.Builder

	if err := m.createBody(&body, "mail/templates/resetPassword.html", map[string]string{"ResetLink": url}); err != nil {
		return nil
	}

	return m.dialer.DialAndSend(m.createMessage(to, body.String(), "Reset your password"))
}
