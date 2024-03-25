import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.Random;

public class MatchingGame implements ActionListener {
    private JFrame mainFrame;
    private Container mainContentPane;
    private ImageIcon cardIcon[];

    public MatchingGame() {
        this.mainFrame = new JFrame("Gra na poprawę pamięci - edycja papieska");
        this.mainFrame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        this.mainFrame.setResizable(false);

        Toolkit kit = Toolkit.getDefaultToolkit();
        Dimension screenSize = kit.getScreenSize();
        int screenWidth = 966;
        int screenHeight = 966;

        this.mainFrame.setSize(screenWidth, screenHeight);
        this.mainFrame.setLocationRelativeTo(null);
        this.mainContentPane = this.mainFrame.getContentPane();
        this.mainContentPane.setLayout(new BoxLayout(this.mainContentPane, BoxLayout.PAGE_AXIS));
        this.mainContentPane.setBackground(Color.ORANGE);

        JMenuBar menuBar = new JMenuBar();
        this.mainFrame.setJMenuBar(menuBar);

        JMenu gameManu = new JMenu("Gra");
        menuBar.add(gameManu);

        newMenuItem("Nowa przygoda", gameManu, this);
        newMenuItem("Najwspanialesze rezultaty", gameManu, this);
        newMenuItem("Wyjście", gameManu, this);

        this.cardIcon = loadCardIcons();
    }

    private ImageIcon[] loadCardIcons() {
        ImageIcon[] icon = new ImageIcon[9];
        for (int i = 0; i < 9; i++) {
            String fileName = "images/default/card" + i + ".jpg";
            icon[i] = new ImageIcon(fileName);
        }
        return icon;
    }

    public JPanel makeCards() {
        JPanel panel = new JPanel(new GridLayout(4, 4));

        ImageIcon backIcon = this.cardIcon[8];
        panel.setOpaque(false);
        CardController controller = new CardController();

        int[] cardsToAdd = new int[16];
        for (int i = 0; i < 8; i++) {
            cardsToAdd[2 * i] = i;
            cardsToAdd[2 * i + 1] = i;
        }

        randomizeCardArray(cardsToAdd);

        for (int i = 0; i < cardsToAdd.length; i++) {
            int num = cardsToAdd[i];
            Card newCard = new Card(controller, this.cardIcon[num], backIcon, num);
            panel.add(newCard);
        }
        return panel;
    }

    private void randomizeCardArray(int[] table) {
        Random random = new Random();
        for (int i = 0; i < table.length; i++){
            int randomInt = random.nextInt(table.length);
            int tmp = table[randomInt];
            table[randomInt] = table[i];
            table[i] = tmp;
        }
    }

    private void newMenuItem(String string, JMenu menu, ActionListener listener) {
        JMenuItem newItem = new JMenuItem(string);
        newItem.setActionCommand(string);
        newItem.addActionListener(listener);
        menu.add(newItem);
    }

    public void newGame() {
        this.mainContentPane.removeAll();
        this.mainContentPane.add(makeCards());
        this.mainFrame.setVisible(true);
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        if (e.getActionCommand().equals("Nowa przygoda")) newGame();
        if (e.getActionCommand().equals("Wyjście")) System.exit(0);
    }
}